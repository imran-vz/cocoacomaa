"use client";

import { AlertTriangle, CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProcessingOverlay } from "@/components/checkout/processing-overlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePostalOrderSettings } from "@/hooks/use-postal-order-settings";
import { useRazorpay } from "@/hooks/use-razorpay";
import {
	formatLocalShortDate,
	formatLongDate,
	formatYearMonth,
} from "@/lib/format-timestamp";
import { formatCurrency } from "@/lib/utils";
import type { RazorpayOptions, RazorpayResponse } from "@/types/razorpay";

export default function RetryPaymentCard({
	order,
}: {
	order: {
		id: string;
		total: string;
		orderType: string;
		createdAt: Date;
		razorpayOrderId: string | null;
		user: {
			name: string | null;
			email: string | null;
			phone: string | null;
		};
	};
}) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingStep, setProcessingStep] = useState("");
	const { openCheckout } = useRazorpay();

	// Get current month for postal order settings check
	const currentMonth = formatYearMonth(new Date());
	const {
		settings,
		getEarliestAvailableSlot,
		isLoading: isSettingsLoading,
	} = usePostalOrderSettings(currentMonth);

	// Check if this is a postal brownie order and validate payment window
	const isPostalOrder = order.orderType === "postal-brownies";

	const isPostalOrderPaymentDisabled = () => {
		if (!isPostalOrder) return false;
		if (!settings || isSettingsLoading) return false;

		const today = new Date().toISOString().split("T")[0];
		const orderCreatedDate = new Date(order.createdAt)
			.toISOString()
			.split("T")[0];

		// Find the slot that was active when the order was created
		const settingsArray = Array.isArray(settings) ? settings : [settings];
		const orderSlot = settingsArray.find(
			(setting) =>
				setting.isActive &&
				orderCreatedDate >= setting.orderStartDate &&
				orderCreatedDate <= setting.orderEndDate,
		);

		if (!orderSlot) return true;

		// Check if we're still within the same slot's ordering window
		const isStillInOrderWindow =
			today >= orderSlot.orderStartDate && today <= orderSlot.orderEndDate;
		return !isStillInOrderWindow;
	};

	const isPostalOrderDisabled = isPostalOrderPaymentDisabled();

	const handleRetryPayment = async () => {
		if (isPostalOrderDisabled) {
			toast.error("Payment window for this order has expired");
			return;
		}

		try {
			setIsProcessing(true);
			setProcessingStep("Preparing payment...");

			let razorpayOrderId = order.razorpayOrderId;
			let amount = Number(order.total) * 100; // Convert to paise

			if (!razorpayOrderId) {
				setProcessingStep("Creating payment order...");
				const response = await fetch("/api/payment/order", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ orderId: order.id }),
				});

				if (!response.ok) {
					throw new Error("Failed to create Razorpay order");
				}

				const data = await response.json();
				razorpayOrderId = data.razorpayOrderId;
				amount = data.amount;
			}

			setProcessingStep("Opening payment gateway...");

			const options: RazorpayOptions = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
				amount,
				currency: "INR",
				name: "Cocoa Comaa",
				description: "Dessert Order Payment",
				order_id: razorpayOrderId!,
				image: "/logo.png",
				remember_customer: true,
				handler: async (response: RazorpayResponse) => {
					try {
						setProcessingStep("Verifying payment...");

						const verifyResponse = await fetch("/api/orders/verify", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								razorpay_order_id: response.razorpay_order_id,
								razorpay_payment_id: response.razorpay_payment_id,
								razorpay_signature: response.razorpay_signature,
								orderId: order.id,
								orderType: order.orderType,
							}),
						});

						if (verifyResponse.ok) {
							setProcessingStep("Payment confirmed!");
							toast.success("Payment successful! Order confirmed.");
							window.location.reload();
						} else {
							throw new Error("Payment verification failed");
						}
					} catch (error) {
						console.error("Payment verification error:", error);
						toast.error("Payment verification failed. Please contact support.");
						setIsProcessing(false);
						setProcessingStep("");
					}
				},
				modal: {
					ondismiss: () => {
						setIsProcessing(false);
						setProcessingStep("");
					},
				},
				prefill: {
					name: order.user.name || "",
					email: order.user.email || "",
					contact: order.user.phone || "",
				},
				theme: { color: "#551303" },
			};

			openCheckout(options);
		} catch (error) {
			console.error("Retry payment error:", error);
			toast.error("Failed to initiate payment. Please try again.");
			setIsProcessing(false);
			setProcessingStep("");
		}
	};

	// Show disabled state for postal orders when payment window has expired
	if (isPostalOrderDisabled && !isSettingsLoading) {
		const nextSlot = getEarliestAvailableSlot();
		const orderCreatedDate = new Date(order.createdAt)
			.toISOString()
			.split("T")[0];

		const settingsArray = Array.isArray(settings)
			? settings
			: settings
				? [settings]
				: [];
		const originalSlot = settingsArray.find(
			(setting) =>
				setting.isActive &&
				orderCreatedDate >= setting.orderStartDate &&
				orderCreatedDate <= setting.orderEndDate,
		);

		return (
			<Card className="border-red-200 bg-red-50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-red-700">
						<AlertTriangle className="h-5 w-5" />
						Payment Window Expired
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="text-sm text-red-600">
						<p className="font-medium mb-2">
							The payment window for this postal brownie order has expired.
						</p>
						{originalSlot ? (
							<p className="mb-2">
								This order was placed during the "{originalSlot.name}" slot (
								{formatLocalShortDate(new Date(originalSlot.orderStartDate))} -{" "}
								{formatLocalShortDate(new Date(originalSlot.orderEndDate))}),
								but payment must be completed within the same ordering window.
							</p>
						) : (
							<p className="mb-2">
								This order was placed during a postal ordering window that has
								now closed.
							</p>
						)}
						{nextSlot ? (
							<p>
								Next slot opens{" "}
								<span className="font-semibold">
									{formatLongDate(new Date(nextSlot.orderStartDate))}
								</span>
								.
							</p>
						) : (
							<p>Check back later for upcoming postal ordering windows.</p>
						)}
						<p className="mt-2 pt-2 border-t border-red-200">
							Order total:{" "}
							<span className="font-semibold">
								{formatCurrency(Number(order.total))}
							</span>
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Show normal payment retry card
	return (
		<Card className="border-orange-200 bg-orange-50">
			<ProcessingOverlay
				isProcessing={isProcessing}
				stepDescription={processingStep}
			/>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-orange-800 text-base">
					<CreditCard className="h-5 w-5" />
					Payment Required
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="text-sm text-orange-700">
					<p>Your payment is pending. Complete it to confirm your order.</p>
					<p className="font-semibold mt-1">
						Total: {formatCurrency(Number(order.total))}
					</p>
				</div>
				<button
					type="button"
					className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
					onClick={handleRetryPayment}
					disabled={isPostalOrderDisabled || isSettingsLoading || isProcessing}
				>
					{isSettingsLoading
						? "Checking..."
						: isProcessing
							? "Processing..."
							: "Retry Payment"}
				</button>
			</CardContent>
		</Card>
	);
}
