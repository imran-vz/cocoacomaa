import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	verifyWebhookSignature,
	handlePaymentCaptured,
	handlePaymentFailed,
	handleOrderPaid,
	type OrderType,
} from "@/lib/payment/payment-service";

interface RazorpayWebhookPayload {
	entity: string;
	account_id: string;
	event: string;
	contains: string[];
	payload: {
		payment?: {
			entity: {
				id: string;
				status: string;
				order_id: string;
				notes: Record<string, string>;
				[key: string]: unknown;
			};
		};
		order?: {
			entity: {
				id: string;
				status: string;
				notes: Record<string, string>;
				[key: string]: unknown;
			};
		};
	};
	created_at: number;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.text();
		const signature = request.headers.get("x-razorpay-signature");

		if (!signature) {
			console.error("Missing Razorpay signature");
			return NextResponse.json({ error: "Missing signature" }, { status: 400 });
		}

		// Verify webhook signature using shared service
		if (!verifyWebhookSignature(body, signature)) {
			console.error("Invalid webhook signature");
			return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
		}

		const payload: RazorpayWebhookPayload = JSON.parse(body);
		const { event, payload: eventPayload } = payload;

		console.log(`Processing Razorpay webhook: ${event}`);

		switch (event) {
			case "payment.captured": {
				if (!eventPayload.payment) {
					console.error("No payment data in payload");
					break;
				}
				const payment = eventPayload.payment.entity;
				const orderId = payment.notes?.orderId;
				const orderType = (payment.notes?.orderType ||
					"cake-orders") as OrderType;

				if (!orderId) {
					console.error("No orderId in payment notes");
					break;
				}

				await handlePaymentCaptured({
					paymentId: payment.id,
					orderId,
					orderType,
				});
				break;
			}

			case "payment.failed": {
				if (!eventPayload.payment) {
					console.error("No payment data in payload");
					break;
				}
				const payment = eventPayload.payment.entity;
				const orderId = payment.notes?.orderId;
				const orderType = (payment.notes?.orderType ||
					"cake-orders") as OrderType;

				if (!orderId) {
					console.error("No orderId in payment notes");
					break;
				}

				await handlePaymentFailed({
					paymentId: payment.id,
					orderId,
					orderType,
				});
				break;
			}

			case "order.paid": {
				if (!eventPayload.order) {
					console.error("No order data in payload");
					break;
				}
				const order = eventPayload.order.entity;
				const orderId = order.notes?.orderId;
				const orderType = (order.notes?.orderType ||
					"cake-orders") as OrderType;

				if (!orderId) {
					console.error("No orderId in order notes");
					break;
				}

				await handleOrderPaid(orderId, orderType);
				break;
			}

			default:
				console.log(`Unhandled webhook event: ${event}`);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Webhook processing error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
