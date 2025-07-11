import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { workshopOrders } from "@/lib/db/schema";

interface VerifyPaymentRequest {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
	orderId: string;
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const body: VerifyPaymentRequest = await request.json();
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
			orderId,
		} = body;

		// Verify payment signature
		const hmac = crypto.createHmac(
			"sha256",
			process.env.RAZORPAY_KEY_SECRET || "",
		);
		hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
		const generated_signature = hmac.digest("hex");

		if (generated_signature !== razorpay_signature) {
			return NextResponse.json(
				{ success: false, message: "Payment verification failed" },
				{ status: 400 },
			);
		}

		// Update workshop order status
		const [updatedOrder] = await db
			.update(workshopOrders)
			.set({
				status: "paid",
				paymentStatus: "captured",
				razorpayPaymentId: razorpay_payment_id,
				razorpaySignature: razorpay_signature,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(workshopOrders.id, orderId),
					eq(workshopOrders.userId, session.user.id),
				),
			)
			.returning();

		if (!updatedOrder) {
			return NextResponse.json(
				{ success: false, message: "Workshop order not found" },
				{ status: 404 },
			);
		}

		// await sendOrderConfirmationEmail(updatedOrder.user.email, updatedOrder.workshop.title);

		return NextResponse.json({
			success: true,
			message: "Payment verified and workshop registration confirmed",
			order: updatedOrder,
		});
	} catch (error) {
		console.error("Error verifying workshop payment:", error);
		return NextResponse.json(
			{ success: false, message: "Payment verification failed" },
			{ status: 500 },
		);
	}
}
