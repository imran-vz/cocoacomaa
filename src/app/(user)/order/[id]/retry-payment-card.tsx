"use client";

import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
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
					className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
					onClick={handleRetryPayment}
				>
					Retry Payment
				</button>
			</CardContent>
		</Card>
	);
}
