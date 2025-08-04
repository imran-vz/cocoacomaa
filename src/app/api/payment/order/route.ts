import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

const razorpay = new Razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
	key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: NextRequest) {
	const { orderId } = await request.json();

	const order = await db.query.orders.findFirst({
		where: eq(orders.id, orderId),
	});

	if (!order) {
		return NextResponse.json({ error: "Order not found" }, { status: 404 });
	}

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
}
