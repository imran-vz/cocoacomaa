import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

import { auth } from "@/auth";
import {
	createUnauthorizedResponse,
	requireAuth,
	requireSessionId,
} from "@/lib/auth-utils";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

const razorpay = new Razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
	key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await auth();
		requireAuth(session);
		const userId = requireSessionId(session);

		// Validate CSRF token
		await validateCsrfToken(request);

		const { orderId } = await request.json();

		// Verify order ownership
		const order = await db.query.orders.findFirst({
			where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
		});

		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		// Create Razorpay order
		const razorpayOrder = await razorpay.orders.create({
			amount: Math.round(Number(order.total) * 100), // Amount in paise
			currency: "INR",
			receipt: `order_${order.id}`,
			notes: {
				orderId: order.id.toString(),
				userId: order.userId.toString(),
				pickupDatetime: order.pickupDateTime?.toISOString() || "",
				orderType: order.orderType,
			},
		});

		// Update order with Razorpay order ID
		await db
			.update(orders)
			.set({
				razorpayOrderId: razorpayOrder.id,
				paymentStatus: "created",
				status: "payment_pending",
				updatedAt: new Date(),
			})
			.where(eq(orders.id, order.id));

		return NextResponse.json({
			success: true,
			orderId: order.id,
			razorpayOrderId: razorpayOrder.id,
			amount: razorpayOrder.amount,
			currency: razorpayOrder.currency,
		});
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("Unauthorized")) {
				return createUnauthorizedResponse(error.message);
			}
			if (error.message.includes("CSRF")) {
				return NextResponse.json({ error: error.message }, { status: 403 });
			}
		}
		console.error("Payment order creation error:", error);
		return NextResponse.json(
			{ error: "Failed to create payment order" },
			{ status: 500 },
		);
	}
}
