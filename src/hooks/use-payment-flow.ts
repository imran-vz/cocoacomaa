"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useRazorpay } from "@/hooks/use-razorpay";
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

// ─── Hook ───────────────────────────────────────────────────────

/**
 * End-to-end payment orchestration hook.
 * Handles: create order → open Razorpay → verify payment → redirect.
 * Works for all order types (cake, postal, specials, workshop).
 */
export function usePaymentFlow(
	config: PaymentFlowConfig,
): UsePaymentFlowReturn {
	const router = useRouter();
	const { isReady, openCheckout } = useRazorpay();
	const [step, setStep] = useState<PaymentFlowStep>("idle");

	const isProcessing = step !== "idle" && step !== "error";

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
			setStep("paying");

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
					try {
						setStep("verifying");

						const verifyResponse = await fetch(getVerifyUrl(), {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								razorpay_order_id: response.razorpay_order_id,
								razorpay_payment_id: response.razorpay_payment_id,
								razorpay_signature: response.razorpay_signature,
								orderId,
								orderType: config.orderType,
							}),
						});

						if (!verifyResponse.ok) {
							const errorData = await verifyResponse.json().catch(() => ({}));
							throw new Error(
								errorData.error ||
									errorData.message ||
									"Payment verification failed",
							);
						}

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
						console.error("Payment verification error:", error);
						setStep("error");
						const err =
							error instanceof Error
								? error
								: new Error("Payment verification failed");
						toast.error(`${err.message}. Please contact support.`);
						config.onError?.(err);
					}
				},
				modal: {
					ondismiss: () => {
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
		[config, openCheckout, getVerifyUrl, router],
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
				setStep("creating");

				const response = await fetch(apiUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				});

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
				console.error("Order creation error:", error);
				setStep("error");
				const err =
					error instanceof Error ? error : new Error("Failed to create order");
				toast.error(err.message);
				config.onError?.(err);
			}
		},
		[handlePayment, config],
	);

	const reset = useCallback(() => {
		setStep("idle");
	}, []);

	return {
		step,
		stepDescription: STEP_DESCRIPTIONS[step],
		isProcessing,
		isReady,
		payExistingOrder,
		createAndPay,
		reset,
	};
}
