"use client";

import { CreditCard, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { usePostalOrderSettings } from "@/hooks/use-postal-order-settings";
import type {
	RazorpayOptions,
	RazorpayOrderData,
	RazorpayResponse,
} from "@/types/razorpay";

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

	// Get current month for postal order settings check
	const currentMonth = format(new Date(), "yyyy-MM");
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

		// If no slot was found for the order creation date, disable payment
		if (!orderSlot) {
			return true;
		}

		// Check if we're still within the same slot's ordering window
		const isStillInOrderWindow =
			today >= orderSlot.orderStartDate && today <= orderSlot.orderEndDate;

		// Disable payment if we're no longer in the original ordering window
		return !isStillInOrderWindow;
	};

	const isPostalOrderDisabled = isPostalOrderPaymentDisabled();

	// Load Razorpay script
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	const handleRetryPayment = async () => {
		// Don't allow payment if postal orders are disabled
		if (isPostalOrderDisabled) {
			toast.error("Payment window for this order has expired");
			return;
		}

		let orderData: RazorpayOrderData;

		if (!order.razorpayOrderId) {
			const response = await fetch("/api/payment/order", {
				method: "POST",
				body: JSON.stringify({ orderId: order.id }),
			});

			if (!response.ok) {
				throw new Error("Failed to create Razorpay order");
			}

			const data = await response.json();

			orderData = data;
		} else {
			orderData = {
				success: true,
				orderId: order.id,
				razorpayOrderId: order.razorpayOrderId,
				currency: "INR",
				amount: Number(order.total),
			};
		}

		await handlePayment(order.id, orderData);
	};

	const handlePayment = async (
		orderId: string,
		razorpayOrderData: RazorpayOrderData,
	) => {
		setProcessingStep("Opening payment gateway...");

		const options: RazorpayOptions = {
			key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
			amount: razorpayOrderData.amount,
			currency: razorpayOrderData.currency,
			name: "Cocoa Comaa",
			description: "Dessert Order Payment",
			order_id: razorpayOrderData.razorpayOrderId,
			image: "/logo.png",
			remember_customer: true,
			handler: async (response: RazorpayResponse) => {
				try {
					setProcessingStep("Verifying payment...");

					// Verify payment
					const verifyResponse = await fetch("/api/orders/verify", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							razorpay_order_id: response.razorpay_order_id,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
							orderId,
						}),
					});

					if (verifyResponse.ok) {
						setProcessingStep("Finalizing order...");

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

		const razorpay = new window.Razorpay(options);
		razorpay.on("payment.failed", (error) => {
			console.error("Payment failed:", error);
			toast.error("Payment failed. Please try again.");
			setIsProcessing(false);
			setProcessingStep("");
		});
		razorpay.open();
	};

	// Show disabled state for postal orders when payment window has expired
	if (isPostalOrderDisabled && !isSettingsLoading) {
		const nextSlot = getEarliestAvailableSlot();
		const orderCreatedDate = new Date(order.createdAt)
			.toISOString()
			.split("T")[0];

		// Find the original slot for better messaging
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
				<CardContent className="space-y-4">
					<div className="text-sm text-red-600">
						<p className="font-medium mb-2">
							The payment window for this postal brownie order has expired.
						</p>
						{originalSlot ? (
							<p className="mb-2">
								This order was placed during the "{originalSlot.name}" slot (
								{format(new Date(originalSlot.orderStartDate), "MMM d")} -{" "}
								{format(new Date(originalSlot.orderEndDate), "MMM d")}), but
								payment must be completed within the same ordering window.
							</p>
						) : (
							<p className="mb-2">
								This order was placed during a postal ordering window that has
								now closed. Payment must be completed within the same ordering
								window.
							</p>
						)}
						{nextSlot ? (
							<p>
								You can place a new order when the next slot opens on{" "}
								<span className="font-semibold">
									{format(new Date(nextSlot.orderStartDate), "MMMM d, yyyy")}
								</span>
								.
							</p>
						) : (
							<p>
								Please check back later for upcoming postal brownie ordering
								windows.
							</p>
						)}
						<p className="mt-3 pt-2 border-t border-red-200">
							Order total:{" "}
							<span className="font-semibold">
								{formatCurrency(Number(order.total))}
							</span>
						</p>
					</div>
					<div className="text-xs text-red-500 bg-red-100 p-3 rounded">
						<p className="font-medium mb-1">Why can't I pay for this order?</p>
						<p>
							Postal brownie orders have specific time windows for both ordering
							and payment. Once an ordering window closes, payments for orders
							from that window are no longer accepted. This ensures fair access
							to limited postal slots for all customers.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Show normal payment retry card
	return (
		<Card className="border-orange-200 bg-orange-50">
			{isProcessing && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-white rounded-lg p-6 sm:p-8 max-w-sm mx-4 text-center shadow-xl">
						<div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4" />
						<h3 className="text-lg sm:text-xl font-semibold mb-2">
							Processing Order
						</h3>
						<p className="text-sm sm:text-base text-muted-foreground">
							{processingStep || "Please wait..."}
						</p>
						<p className="text-xs text-muted-foreground mt-2">
							Do not close this window
						</p>
					</div>
				</div>
			)}

			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-orange-800">
					<CreditCard className="h-5 w-5" />
					Payment Required
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="text-sm text-orange-700">
					<p className="font-medium mb-2">
						Your payment is still pending. Please complete the payment to
						confirm your order.
					</p>
					<p>
						Order total:{" "}
						<span className="font-semibold">
							{formatCurrency(Number(order.total))}
						</span>
					</p>
				</div>
				<button
					type="button"
					className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
					onClick={handleRetryPayment}
					disabled={isPostalOrderDisabled || isSettingsLoading}
				>
					{isSettingsLoading ? "Checking availability..." : "Retry Payment"}
				</button>
			</CardContent>
		</Card>
	);
}
