import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { event, orderId, paymentId, orderType } = await request.json();

		// Create a mock webhook payload
		const mockPayload = {
			entity: "event",
			account_id: "acc_test",
			event: event,
			contains: ["payment"],
			payload: {
				payment: {
					entity: {
						id: paymentId || "pay_test123",
						entity: "payment",
						amount: 10000,
						currency: "INR",
						status: event === "payment.captured" ? "captured" : "failed",
						order_id: "order_test123",
						invoice_id: null,
						international: false,
						method: "card",
						amount_refunded: 0,
						refund_status: null,
						captured: event === "payment.captured",
						description: null,
						card_id: null,
						bank: null,
						wallet: null,
						vpa: null,
						email: "test@example.com",
						contact: "+919999999999",
						notes: {
							orderId: orderId || "test_order_123",
							orderType: orderType || "cake-orders",
						},
						fee: 0,
						tax: 0,
						error_code: event === "payment.failed" ? "PAYMENT_DECLINED" : null,
						error_description:
							event === "payment.failed" ? "Payment was declined" : null,
						error_source: event === "payment.failed" ? "gateway" : null,
						error_step:
							event === "payment.failed" ? "payment_processing" : null,
						error_reason: event === "payment.failed" ? "card_declined" : null,
						acquirer_data: {},
						created_at: Date.now(),
					},
				},
			},
			created_at: Date.now(),
		};

		// Create signature
		const body = JSON.stringify(mockPayload);
		const signature = crypto
			.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
			.update(body)
			.digest("hex");

		// Forward to the actual webhook endpoint
		const response = await fetch(
			`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/webhooks/razorpay`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-razorpay-signature": signature,
				},
				body: body,
			},
		);

		const result = await response.json();

		return NextResponse.json({
			success: true,
			message: `Test webhook sent for event: ${event}`,
			result,
		});
	} catch (error) {
		console.error("Test webhook error:", error);
		return NextResponse.json(
			{ error: "Failed to send test webhook" },
			{ status: 500 },
		);
	}
}
