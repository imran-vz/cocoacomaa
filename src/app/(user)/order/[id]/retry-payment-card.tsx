"use client";

import { AlertTriangle, CreditCard } from "lucide-react";
// useState is no longer needed
import { toast } from "sonner";

import { ProcessingOverlay } from "@/components/checkout/processing-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaymentFlow } from "@/hooks/use-payment-flow";
import { usePostalOrderSettings } from "@/hooks/use-postal-order-settings";
import {
	formatLocalShortDate,
	formatLongDate,
	formatYearMonth,
} from "@/lib/format-timestamp";
import type { OrderType } from "@/lib/payment/payment-service";
import { formatCurrency } from "@/lib/utils";

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
	const { stepDescription, isProcessing, payExistingOrder } = usePaymentFlow({
		orderType: order.orderType as OrderType,
		prefill: {
			name: order.user.name || "",
			email: order.user.email || "",
			phone: order.user.phone || "",
		},
		description: "Order Payment Retry",
		onSuccess: () => {
			window.location.reload();
		},
	});

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
			let razorpayOrderId = order.razorpayOrderId;
			let amount = Number(order.total) * 100; // Convert to paise

			if (!razorpayOrderId) {
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

			if (razorpayOrderId) {
				payExistingOrder(order.id, razorpayOrderId, amount);
			}
		} catch (error) {
			console.error("Retry payment error:", error);
			toast.error("Failed to initiate payment. Please try again.");
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
		<Card className="border-orange-200 bg-orange-50 overflow-hidden shadow-sm">
			<ProcessingOverlay
				isProcessing={isProcessing}
				stepDescription={stepDescription}
			/>
			<CardHeader className="pb-3 border-b border-orange-200/50 bg-orange-100/50">
				<CardTitle className="flex items-center gap-2 text-orange-800 text-base sm:text-lg">
					<CreditCard className="h-5 w-5 shrink-0" />
					Payment Required
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 pt-4">
				<div className="text-sm sm:text-base text-orange-800/90 leading-relaxed">
					<p>Your payment is pending. Complete it to confirm your order.</p>
					<div className="mt-4 p-3 bg-white/60 rounded-lg flex items-center justify-between">
						<span className="font-medium text-orange-900">Total Amount</span>
						<span className="font-bold text-lg text-orange-950">
							{formatCurrency(Number(order.total))}
						</span>
					</div>
				</div>
				<Button
					type="button"
					className="w-full sm:text-base h-11 sm:h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all active:scale-[0.98] mt-2"
					onClick={handleRetryPayment}
					disabled={isPostalOrderDisabled || isSettingsLoading || isProcessing}
				>
					{isSettingsLoading
						? "Checking Availability..."
						: isProcessing
							? "Processing Payment..."
							: "Pay Now to Confirm Order"}
				</Button>
			</CardContent>
		</Card>
	);
}
