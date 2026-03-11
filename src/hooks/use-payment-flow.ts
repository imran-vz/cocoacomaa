"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRazorpay } from "@/hooks/use-razorpay";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import type { OrderType } from "@/lib/payment/payment-service";
import type { RazorpayOptions, RazorpayResponse } from "@/types/razorpay";

// ─── Types ──────────────────────────────────────────────────────

export type PaymentFlowStep =
	| "idle"
	| "creating"
	| "paying"
	| "verifying"
	| "success"
	| "error";

interface PaymentFlowConfig {
	/** Prefill details for Razorpay checkout */
	prefill: {
		name: string;
		email: string;
		phone: string;
	};
	/** Order type for verification routing */
	orderType: OrderType;
	/** Description shown in Razorpay checkout */
	description?: string;
	/** Redirect URL after successful payment (e.g. /order-confirmation?orderId=xxx) */
	successRedirect?: string;
	/** Called when payment is successful */
	onSuccess?: (orderId: string) => void;
	/** Called when payment fails or is cancelled */
	onError?: (error: Error) => void;
	/** Called when Razorpay modal is dismissed */
	onDismiss?: () => void;
}

interface CreateOrderResponse {
	success: boolean;
	orderId: string;
	razorpayOrderId: string;
	amount: number;
	currency: string;
	error?: string;
}

interface UsePaymentFlowReturn {
	/** Current step in the payment flow */
	step: PaymentFlowStep;
	/** Human-readable description of current step */
	stepDescription: string;
	/** Whether payment is in progress */
	isProcessing: boolean;
	/** Whether the Razorpay script is ready */
	isReady: boolean;
	/** Whether the Razorpay script failed to load */
	hasScriptError: boolean;
	/** Error message from Razorpay script load failure */
	scriptErrorMessage: string | null;
	/** Retry loading the Razorpay script */
	retryScriptLoad: () => void;
	/** Start payment with an existing order (for retry flows) */
	payExistingOrder: (
		orderId: string,
		razorpayOrderId: string,
		amount: number,
		currency?: string,
	) => void;
	/** Start payment by creating an order first via API */
	createAndPay: (
		apiUrl: string,
		body: Record<string, unknown>,
	) => Promise<void>;
	/** Reset the payment flow to idle */
	reset: () => void;
}

const STEP_DESCRIPTIONS: Record<PaymentFlowStep, string> = {
	idle: "",
	creating: "Creating your order...",
	paying: "Opening payment gateway...",
	verifying: "Verifying payment...",
	success: "Payment successful!",
	error: "Payment failed",
};

/**
 * How long (in ms) to keep the "paying" state before considering
 * the payment abandoned if the Razorpay modal hasn't called back.
 * This is a safety net — Razorpay's `ondismiss` should fire first.
 */
const PAYMENT_ABANDON_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Retry configuration for payment verification requests.
 * Verification is idempotent (signature check + DB upsert), so retrying is safe.
 */
const VERIFY_RETRY_OPTIONS = {
	maxRetries: 2,
	baseDelay: 1000,
	maxDelay: 5000,
	timeout: 20000,
	retryMutations: true, // POST but idempotent
};

/**
 * Retry configuration for order creation.
 * Order creation is NOT idempotent, so we do NOT retry by default.
 * The caller should handle retry (e.g. reusing an existing orderId).
 */
const CREATE_ORDER_RETRY_OPTIONS = {
	maxRetries: 0, // No automatic retries for mutations
	timeout: 20000,
	retryMutations: false,
};

// ─── Hook ───────────────────────────────────────────────────────

/**
 * End-to-end payment orchestration hook.
 * Handles: create order → open Razorpay → verify payment → redirect.
 * Works for all order types (cake, postal, specials, workshop).
 *
 * Phase 4 enhancements:
 * - Razorpay script load failure recovery with `retryScriptLoad()`
 * - Payment timeout/abandonment detection (10-minute safety net)
 * - Retry logic for verification API calls via `fetchWithRetry`
 * - Graceful error handling when Razorpay is not ready
 */
export function usePaymentFlow(
	config: PaymentFlowConfig,
): UsePaymentFlowReturn {
	const router = useRouter();
	const {
		isReady,
		hasError: hasScriptError,
		errorMessage: scriptErrorMessage,
		retryLoad: retryScriptLoad,
		openCheckout,
	} = useRazorpay();
	const [step, setStep] = useState<PaymentFlowStep>("idle");

	const isProcessing = step !== "idle" && step !== "error";

	// Track the abandon timeout so we can clear it on success/dismiss
	const abandonTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			if (abandonTimeoutRef.current) {
				clearTimeout(abandonTimeoutRef.current);
				abandonTimeoutRef.current = null;
			}
		};
	}, []);

	const clearAbandonTimeout = useCallback(() => {
		if (abandonTimeoutRef.current) {
			clearTimeout(abandonTimeoutRef.current);
			abandonTimeoutRef.current = null;
		}
	}, []);

	/**
	 * Start an abandon timer when entering the "paying" step.
	 * If neither `handler` nor `ondismiss` fires within the timeout,
	 * we assume the user abandoned and reset the flow.
	 */
	const startAbandonTimeout = useCallback(
		(orderId: string) => {
			clearAbandonTimeout();
			abandonTimeoutRef.current = setTimeout(() => {
				if (!isMountedRef.current) return;
				// Only reset if still in "paying" state (user didn't interact)
				setStep((current) => {
					if (current === "paying") {
						console.warn(
							`Payment timeout: order ${orderId} abandoned after ${PAYMENT_ABANDON_TIMEOUT_MS / 1000}s`,
						);
						toast.info(
							"Your payment session timed out. Your order has been saved — you can retry payment anytime.",
							{ duration: 8000 },
						);
						config.onDismiss?.();
						return "idle";
					}
					return current;
				});
			}, PAYMENT_ABANDON_TIMEOUT_MS);
		},
		[clearAbandonTimeout, config],
	);

	const getVerifyUrl = useCallback((): string => {
		if (config.orderType === "workshop") {
			return "/api/workshop-orders/verify";
		}
		return "/api/orders/verify";
	}, [config.orderType]);

	const handlePayment = useCallback(
		(
			orderId: string,
			razorpayOrderId: string,
			amount: number,
			currency = "INR",
		) => {
			// ── Guard: Razorpay not ready ─────────────────────────────
			if (hasScriptError) {
				const err = new Error(
					scriptErrorMessage ||
						"Payment gateway failed to load. Please refresh the page and try again.",
				);
				setStep("error");
				toast.error(err.message, { duration: 8000 });
				config.onError?.(err);
				return;
			}

			if (!isReady) {
				toast.info("Payment gateway is still loading. Please wait a moment...");
				// Retry opening after a short delay (the script may finish loading)
				const retryDelay = 2000;
				const retryTimer = setTimeout(() => {
					if (!isMountedRef.current) return;
					if (window.Razorpay) {
						handlePayment(orderId, razorpayOrderId, amount, currency);
					} else {
						setStep("error");
						const err = new Error(
							"Payment gateway could not be loaded. Please refresh the page.",
						);
						toast.error(err.message);
						config.onError?.(err);
					}
				}, retryDelay);

				// Clean up on unmount
				const cleanup = () => clearTimeout(retryTimer);
				if (!isMountedRef.current) cleanup();
				return;
			}

			setStep("paying");
			startAbandonTimeout(orderId);

			const options: RazorpayOptions = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
				amount,
				currency,
				name: "Cocoa Comaa",
				description: config.description || "Order Payment",
				order_id: razorpayOrderId,
				image: "/logo.png",
				remember_customer: true,
				handler: async (response: RazorpayResponse) => {
					clearAbandonTimeout();

					try {
						if (!isMountedRef.current) return;
						setStep("verifying");

						const verifyResponse = await fetchWithRetry(
							getVerifyUrl(),
							{
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									razorpay_order_id: response.razorpay_order_id,
									razorpay_payment_id: response.razorpay_payment_id,
									razorpay_signature: response.razorpay_signature,
									orderId,
									orderType: config.orderType,
								}),
							},
							VERIFY_RETRY_OPTIONS,
						);

						if (!verifyResponse.ok) {
							const errorData = await verifyResponse.json().catch(() => ({}));
							throw new Error(
								errorData.error ||
									errorData.message ||
									"Payment verification failed",
							);
						}

						if (!isMountedRef.current) return;
						setStep("success");
						toast.success("Payment successful! Order confirmed.");
						config.onSuccess?.(orderId);

						if (config.successRedirect) {
							const redirect = config.successRedirect.includes("?")
								? `${config.successRedirect}&orderId=${orderId}`
								: `${config.successRedirect}?orderId=${orderId}`;
							router.push(redirect);
						}
					} catch (error) {
						if (!isMountedRef.current) return;
						console.error("Payment verification error:", error);
						setStep("error");

						// Differentiate between network errors and server errors
						const isNetworkError =
							error instanceof TypeError && error.message === "Failed to fetch";

						const errorMessage = isNetworkError
							? "We couldn't verify your payment due to a connection issue. Don't worry — if payment was deducted, it will be confirmed automatically via our payment provider, or refunded within 5-7 business days."
							: `${error instanceof Error ? error.message : "Payment verification failed"}. If money was deducted, it will be confirmed automatically or refunded within 5-7 business days.`;

						toast.error(errorMessage, { duration: 10000 });
						config.onError?.(
							error instanceof Error
								? error
								: new Error("Payment verification failed"),
						);
					}
				},
				modal: {
					ondismiss: () => {
						clearAbandonTimeout();
						if (!isMountedRef.current) return;
						setStep("idle");
						config.onDismiss?.();
					},
				},
				prefill: {
					name: config.prefill.name,
					email: config.prefill.email,
					contact: config.prefill.phone,
				},
				theme: { color: "#551303" },
			};

			openCheckout(options);
		},
		[
			config,
			isReady,
			hasScriptError,
			scriptErrorMessage,
			openCheckout,
			getVerifyUrl,
			router,
			startAbandonTimeout,
			clearAbandonTimeout,
		],
	);

	const payExistingOrder = useCallback(
		(
			orderId: string,
			razorpayOrderId: string,
			amount: number,
			currency = "INR",
		) => {
			handlePayment(orderId, razorpayOrderId, amount, currency);
		},
		[handlePayment],
	);

	const createAndPay = useCallback(
		async (apiUrl: string, body: Record<string, unknown>) => {
			try {
				if (!isMountedRef.current) return;
				setStep("creating");

				const response = await fetchWithRetry(
					apiUrl,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(body),
					},
					CREATE_ORDER_RETRY_OPTIONS,
				);

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(
						errorData.error || errorData.message || "Failed to create order",
					);
				}

				const data: CreateOrderResponse = await response.json();

				if (!data.success) {
					throw new Error(data.error || "Failed to create order");
				}

				handlePayment(
					data.orderId,
					data.razorpayOrderId,
					data.amount,
					data.currency,
				);
			} catch (error) {
				if (!isMountedRef.current) return;
				console.error("Order creation error:", error);
				setStep("error");

				const isNetworkError =
					error instanceof TypeError && error.message === "Failed to fetch";

				const err = isNetworkError
					? new Error(
							"Couldn't reach our servers. Please check your internet connection and try again.",
						)
					: error instanceof Error
						? error
						: new Error("Failed to create order");

				toast.error(err.message);
				config.onError?.(err);
			}
		},
		[handlePayment, config],
	);

	const reset = useCallback(() => {
		clearAbandonTimeout();
		setStep("idle");
	}, [clearAbandonTimeout]);

	return {
		step,
		stepDescription: STEP_DESCRIPTIONS[step],
		isProcessing,
		isReady,
		hasScriptError,
		scriptErrorMessage,
		retryScriptLoad,
		payExistingOrder,
		createAndPay,
		reset,
	};
}
