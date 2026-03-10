import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
	createUnauthorizedResponse,
	requireAuth,
	requireSessionId,
} from "@/lib/auth-utils";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import {
	createRazorpayOrder,
	type OrderType,
} from "@/lib/payment/payment-service";

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await auth.api.getSession({ headers: await headers() });
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

		// Create Razorpay order using shared service
		const result = await createRazorpayOrder({
			orderId: order.id,
			amount: Number(order.total),
			orderType: order.orderType as OrderType,
			notes: {
				userId: order.userId,
				pickupDatetime: order.pickupDateTime?.toISOString() || "",
			},
		});

		return NextResponse.json({
			success: true,
			orderId: order.id,
			razorpayOrderId: result.razorpayOrderId,
			amount: result.amount,
			currency: result.currency,
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
