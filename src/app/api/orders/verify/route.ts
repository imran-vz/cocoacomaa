import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
	createUnauthorizedResponse,
	requireAuth,
	requireSessionId,
} from "@/lib/auth-utils";
import { type OrderType, verifyPayment } from "@/lib/payment/payment-service";

interface VerifyPaymentRequest {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
	orderId: string;
	orderType?: OrderType;
}

export async function POST(request: NextRequest) {
	try {
		// Authenticate the request
		const session = await auth.api.getSession({ headers: await headers() });
		requireAuth(session);
		requireSessionId(session);

		const body: VerifyPaymentRequest = await request.json();
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
			orderId,
			orderType = "cake-orders",
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

		// Use shared payment service for verification
		const result = await verifyPayment({
			razorpayOrderId: razorpay_order_id,
			razorpayPaymentId: razorpay_payment_id,
			razorpaySignature: razorpay_signature,
			orderId,
			orderType,
		});

		return NextResponse.json({
			success: result.success,
			message: "Payment verified successfully",
			paymentStatus: result.paymentStatus,
			orderStatus: result.orderStatus,
		});
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("Unauthorized")) {
				return createUnauthorizedResponse(error.message);
			}
			if (error.message === "Invalid payment signature") {
				return NextResponse.json(
					{ error: "Invalid signature" },
					{ status: 400 },
				);
			}
			if (error.message.includes("not found")) {
				return NextResponse.json({ error: error.message }, { status: 404 });
			}
		}
		console.error("Error verifying payment:", error);
		return NextResponse.json(
			{ error: "Failed to verify payment" },
			{ status: 500 },
		);
	}
}
