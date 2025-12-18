import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
	try {
		const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
		const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
		const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

		const status = {
			webhook_secret_configured: !!webhookSecret,
			razorpay_key_configured: !!razorpayKeyId && !!razorpayKeySecret,
			webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/razorpay`,
			supported_events: ["payment.captured", "payment.failed", "order.paid"],
			timestamp: new Date().toISOString(),
		};

		return NextResponse.json(status);
	} catch (error) {
		console.error("Webhook status error:", error);
		return NextResponse.json(
			{ error: "Failed to get webhook status" },
			{ status: 500 },
		);
	}
}
