import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { sendOrderConfirmationEmail } from "@/lib/email";

const razorpay = new Razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
	key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

interface VerifyPaymentRequest {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
	orderId: string;
}

export async function POST(request: NextRequest) {
	try {
		const body: VerifyPaymentRequest = await request.json();
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
			orderId,
		} = body;

		// Validate required fields
		if (
			!razorpay_order_id ||
			!razorpay_payment_id ||
			!razorpay_signature ||
			!orderId
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Verify signature
		const body_string = `${razorpay_order_id}|${razorpay_payment_id}`;
		const expected_signature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
			.update(body_string)
			.digest("hex");

		if (expected_signature !== razorpay_signature) {
			return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
		}

		// Fetch payment details from Razorpay
		const payment = await razorpay.payments.fetch(razorpay_payment_id);

		// Update order in database
		const updatedOrder = await db
			.update(orders)
			.set({
				razorpayPaymentId: razorpay_payment_id,
				razorpaySignature: razorpay_signature,
				paymentStatus:
					payment.status === "captured" ? "captured" : "authorized",
				status: payment.status === "captured" ? "paid" : "payment_pending",
				updatedAt: new Date(),
			})
			.where(eq(orders.id, orderId))
			.returning();

		if (updatedOrder.length === 0) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		// Send confirmation email if payment is successfully captured
		if (payment.status === "captured") {
			try {
				// Fetch complete order details for email
				const fullOrderDetails = await db.query.orders.findFirst({
					where: eq(orders.id, orderId),
					columns: {
						id: true,
						total: true,
						createdAt: true,
						notes: true,
						pickupDateTime: true,
						orderType: true,
					},
					with: {
						orderItems: {
							columns: {
								quantity: true,
								price: true,
								itemName: true,
							},
						},
						user: {
							columns: {
								name: true,
								email: true,
							},
						},
						address: {
							columns: {
								addressLine1: true,
								addressLine2: true,
								city: true,
								state: true,
								zip: true,
							},
						},
					},
				});

				if (fullOrderDetails) {
					// Send email in background (don't wait for it)
					sendOrderConfirmationEmail(fullOrderDetails).catch((emailError) => {
						console.error(
							`Failed to send order confirmation email for order ${orderId}:`,
							emailError,
						);
					});
				}
			} catch (emailError) {
				// Log error but don't fail the request
				console.error(
					`Error preparing email for order ${orderId}:`,
					emailError,
				);
			}
		}

		return NextResponse.json({
			success: true,
			message: "Payment verified successfully",
			paymentStatus: payment.status,
			orderStatus: updatedOrder[0].status,
		});
	} catch (error) {
		console.error("Error verifying payment:", error);
		return NextResponse.json(
			{ error: "Failed to verify payment" },
			{ status: 500 },
		);
	}
}
