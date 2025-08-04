import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, workshopOrders } from "@/lib/db/schema";
import { sendOrderConfirmationEmail } from "@/lib/email";

interface RazorpayWebhookPayload {
	entity: string;
	account_id: string;
	event: string;
	contains: string[];
	payload: {
		payment?: {
			entity: {
				id: string;
				entity: string;
				amount: number;
				currency: string;
				status: string;
				order_id: string;
				invoice_id: string | null;
				international: boolean;
				method: string;
				amount_refunded: number;
				refund_status: string | null;
				captured: boolean;
				description: string | null;
				card_id: string | null;
				bank: string | null;
				wallet: string | null;
				vpa: string | null;
				email: string;
				contact: string;
				notes: Record<string, string>;
				fee: number;
				tax: number;
				error_code: string | null;
				error_description: string | null;
				error_source: string | null;
				error_step: string | null;
				error_reason: string | null;
				acquirer_data: Record<string, unknown>;
				created_at: number;
			};
		};
		order?: {
			entity: {
				id: string;
				entity: string;
				amount: number;
				amount_paid: number;
				amount_due: number;
				currency: string;
				receipt: string;
				offer_id: string | null;
				status: string;
				attempts: number;
				notes: Record<string, string>;
				created_at: number;
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

		// Verify webhook signature
		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
			.update(body)
			.digest("hex");

		if (signature !== expectedSignature) {
			console.error("Invalid webhook signature");
			return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
		}

		const payload: RazorpayWebhookPayload = JSON.parse(body);
		const { event, payload: eventPayload } = payload;

		console.log(`Processing Razorpay webhook: ${event}`);

		switch (event) {
			case "payment.captured":
				await handlePaymentCaptured(eventPayload);
				break;
			case "payment.failed":
				await handlePaymentFailed(eventPayload);
				break;
			case "order.paid":
				await handleOrderPaid(eventPayload);
				break;
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

async function handlePaymentCaptured(
	payload: RazorpayWebhookPayload["payload"],
) {
	if (!payload.payment) {
		console.error("No payment data in payload");
		return;
	}

	const payment = payload.payment.entity;
	const orderId = payment.notes?.orderId;
	const orderType = payment.notes?.orderType;

	if (!orderId) {
		console.error("No orderId in payment notes");
		return;
	}

	console.log(
		`Payment captured for ${orderType || "unknown"} order: ${orderId}`,
	);

	// Try to update regular order first
	const updatedOrder = await db
		.update(orders)
		.set({
			razorpayPaymentId: payment.id,
			paymentStatus: "captured",
			status: "paid",
			updatedAt: new Date(),
		})
		.where(eq(orders.id, orderId))
		.returning();

	// If no regular order was updated, try workshop order
	if (updatedOrder.length === 0) {
		const updatedWorkshopOrder = await db
			.update(workshopOrders)
			.set({
				razorpayPaymentId: payment.id,
				paymentStatus: "captured",
				status: "paid",
				updatedAt: new Date(),
			})
			.where(eq(workshopOrders.id, orderId))
			.returning();

		if (updatedWorkshopOrder.length === 0) {
			console.error(`No order found with ID: ${orderId}`);
			return;
		}

		console.log(`Workshop order updated: ${orderId}`);
	} else {
		console.log(`${orderType || "Regular"} order updated: ${orderId}`);
	}

	// Send confirmation email for regular orders
	try {
		const order = await db.query.orders.findFirst({
			where: eq(orders.id, orderId),
			with: {
				user: {
					columns: {
						name: true,
						email: true,
					},
				},
				orderItems: true,
			},
		});

		if (order) {
			await sendOrderConfirmationEmail(order);
		}
	} catch (error) {
		console.error("Failed to send confirmation email:", error);
	}
}

async function handlePaymentFailed(payload: RazorpayWebhookPayload["payload"]) {
	if (!payload.payment) {
		console.error("No payment data in payload");
		return;
	}

	const payment = payload.payment.entity;
	const orderId = payment.notes?.orderId;
	const orderType = payment.notes?.orderType;

	if (!orderId) {
		console.error("No orderId in payment notes");
		return;
	}

	console.log(`Payment failed for ${orderType || "unknown"} order: ${orderId}`);

	// Try to update regular order first
	const updatedOrder = await db
		.update(orders)
		.set({
			razorpayPaymentId: payment.id,
			paymentStatus: "failed",
			status: "payment_pending",
			updatedAt: new Date(),
		})
		.where(eq(orders.id, orderId))
		.returning();

	// If no regular order was updated, try workshop order
	if (updatedOrder.length === 0) {
		const updatedWorkshopOrder = await db
			.update(workshopOrders)
			.set({
				razorpayPaymentId: payment.id,
				paymentStatus: "failed",
				status: "payment_pending",
				updatedAt: new Date(),
			})
			.where(eq(workshopOrders.id, orderId))
			.returning();

		if (updatedWorkshopOrder.length === 0) {
			console.error(`No order found with ID: ${orderId}`);
			return;
		}

		console.log(`Workshop order payment failed: ${orderId}`);
	} else {
		console.log(`${orderType || "Regular"} order payment failed: ${orderId}`);
	}
}

async function handleOrderPaid(payload: RazorpayWebhookPayload["payload"]) {
	if (!payload.order) {
		console.error("No order data in payload");
		return;
	}

	const order = payload.order.entity;
	const orderId = order.notes?.orderId;
	const orderType = order.notes?.orderType;

	if (!orderId) {
		console.error("No orderId in order notes");
		return;
	}

	console.log(`${orderType || "Unknown"} order paid: ${orderId}`);

	// Try to update regular order first
	const updatedOrder = await db
		.update(orders)
		.set({
			status: "paid",
			updatedAt: new Date(),
		})
		.where(eq(orders.id, orderId))
		.returning();

	// If no regular order was updated, try workshop order
	if (updatedOrder.length === 0) {
		const updatedWorkshopOrder = await db
			.update(workshopOrders)
			.set({
				status: "paid",
				updatedAt: new Date(),
			})
			.where(eq(workshopOrders.id, orderId))
			.returning();

		if (updatedWorkshopOrder.length === 0) {
			console.error(`No order found with ID: ${orderId}`);
			return;
		}

		console.log(`Workshop order marked as paid: ${orderId}`);
	} else {
		console.log(`${orderType || "Regular"} order marked as paid: ${orderId}`);
	}
}
