import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, workshopOrders } from "@/lib/db/schema";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { razorpay } from "@/lib/razorpay";

// ─── Types ──────────────────────────────────────────────────────

export type OrderType =
	| "cake-orders"
	| "postal-brownies"
	| "specials"
	| "workshop";

interface CreateRazorpayOrderInput {
	/** Internal order ID (from orders or workshopOrders table) */
	orderId: string;
	/** Amount in INR (rupees, not paise) */
	amount: number;
	/** Type of order for routing webhook logic */
	orderType: OrderType;
	/** Additional metadata for Razorpay notes */
	notes?: Record<string, string>;
}

interface CreateRazorpayOrderResult {
	razorpayOrderId: string;
	amount: number;
	currency: string;
}

interface VerifyPaymentInput {
	razorpayOrderId: string;
	razorpayPaymentId: string;
	razorpaySignature: string;
	orderId: string;
	orderType: OrderType;
}

interface VerifyPaymentResult {
	success: boolean;
	paymentStatus: string;
	orderStatus: string;
}

interface HandleWebhookPaymentInput {
	paymentId: string;
	orderId: string;
	orderType: OrderType;
}

// ─── Razorpay Order Creation ────────────────────────────────────

/**
 * Creates a Razorpay order and updates the corresponding DB record.
 * Works for both regular orders (orders table) and workshop orders (workshopOrders table).
 */
export async function createRazorpayOrder(
	input: CreateRazorpayOrderInput,
): Promise<CreateRazorpayOrderResult> {
	const { orderId, amount, orderType, notes = {} } = input;

	// Create Razorpay order (amount in paise)
	const razorpayOrder = await razorpay.orders.create({
		amount: Math.round(amount * 100),
		currency: "INR",
		receipt: `${orderType === "workshop" ? "workshop" : "order"}_${orderId}`,
		notes: {
			orderId,
			orderType,
			...notes,
		},
	});

	// Update the corresponding DB table with Razorpay order ID
	if (orderType === "workshop") {
		await db
			.update(workshopOrders)
			.set({
				razorpayOrderId: razorpayOrder.id,
				paymentStatus: "created",
				status: "payment_pending",
				updatedAt: new Date(),
			})
			.where(eq(workshopOrders.id, orderId));
	} else {
		await db
			.update(orders)
			.set({
				razorpayOrderId: razorpayOrder.id,
				paymentStatus: "created",
				status: "payment_pending",
				updatedAt: new Date(),
			})
			.where(eq(orders.id, orderId));
	}

	return {
		razorpayOrderId: razorpayOrder.id,
		amount: razorpayOrder.amount as number,
		currency: razorpayOrder.currency,
	};
}

// ─── Payment Signature Verification ────────────────────────────

/**
 * Verifies only the Razorpay payment signature (no DB update).
 * Use this when you need custom post-verification logic (e.g. workshop slot checking).
 * @throws Error if signature is invalid
 */
export function verifyPaymentSignatureOnly(
	razorpayOrderId: string,
	razorpayPaymentId: string,
	razorpaySignature: string,
): void {
	const expectedSignature = crypto
		.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
		.update(`${razorpayOrderId}|${razorpayPaymentId}`)
		.digest("hex");

	if (expectedSignature !== razorpaySignature) {
		throw new Error("Invalid payment signature");
	}
}

/**
 * Verifies the Razorpay payment signature (double verification: signature + payment status fetch).
 * Updates the DB record with payment details.
 */
export async function verifyPayment(
	input: VerifyPaymentInput,
): Promise<VerifyPaymentResult> {
	const {
		razorpayOrderId,
		razorpayPaymentId,
		razorpaySignature,
		orderId,
		orderType,
	} = input;

	// Step 1: Cryptographic signature verification
	const expectedSignature = crypto
		.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
		.update(`${razorpayOrderId}|${razorpayPaymentId}`)
		.digest("hex");

	if (expectedSignature !== razorpaySignature) {
		throw new Error("Invalid payment signature");
	}

	// Step 2: Fetch payment details from Razorpay to confirm status
	const payment = await razorpay.payments.fetch(razorpayPaymentId);

	const paymentStatus =
		payment.status === "captured" ? "captured" : "authorized";
	const orderStatus =
		payment.status === "captured" ? "paid" : "payment_pending";

	// Step 3: Update DB record
	if (orderType === "workshop") {
		const updated = await db
			.update(workshopOrders)
			.set({
				razorpayPaymentId,
				razorpaySignature,
				paymentStatus,
				status: orderStatus,
				updatedAt: new Date(),
			})
			.where(eq(workshopOrders.id, orderId))
			.returning();

		if (updated.length === 0) {
			throw new Error("Workshop order not found");
		}
	} else {
		const updated = await db
			.update(orders)
			.set({
				razorpayPaymentId,
				razorpaySignature,
				paymentStatus,
				status: orderStatus,
				updatedAt: new Date(),
			})
			.where(eq(orders.id, orderId))
			.returning();

		if (updated.length === 0) {
			throw new Error("Order not found");
		}

		// Send confirmation email for captured payments on regular orders
		if (payment.status === "captured") {
			sendOrderConfirmationEmailAsync(orderId);
		}
	}

	return {
		success: true,
		paymentStatus,
		orderStatus,
	};
}

// ─── Webhook Handlers ──────────────────────────────────────────

/**
 * Verifies the Razorpay webhook signature using HMAC.
 */
export function verifyWebhookSignature(
	body: string,
	signature: string,
): boolean {
	const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
	if (!webhookSecret) {
		console.error("RAZORPAY_WEBHOOK_SECRET is not set");
		return false;
	}

	const expectedSignature = crypto
		.createHmac("sha256", webhookSecret)
		.update(body)
		.digest("hex");

	return signature === expectedSignature;
}

/**
 * Handles a captured payment from webhook.
 * Uses orderType from Razorpay notes to update the correct table.
 */
export async function handlePaymentCaptured(
	input: HandleWebhookPaymentInput,
): Promise<void> {
	const { paymentId, orderId, orderType } = input;

	if (orderType === "workshop") {
		const updated = await db
			.update(workshopOrders)
			.set({
				razorpayPaymentId: paymentId,
				paymentStatus: "captured",
				status: "paid",
				updatedAt: new Date(),
			})
			.where(eq(workshopOrders.id, orderId))
			.returning();

		if (updated.length === 0) {
			console.error(`Workshop order not found: ${orderId}`);
		} else {
			console.log(`Workshop order payment captured: ${orderId}`);
		}
	} else {
		const updated = await db
			.update(orders)
			.set({
				razorpayPaymentId: paymentId,
				paymentStatus: "captured",
				status: "paid",
				updatedAt: new Date(),
			})
			.where(eq(orders.id, orderId))
			.returning();

		if (updated.length === 0) {
			console.error(`Order not found: ${orderId}`);
		} else {
			console.log(`Order payment captured: ${orderId}`);
			// Send confirmation email
			sendOrderConfirmationEmailAsync(orderId);
		}
	}
}

/**
 * Handles a failed payment from webhook.
 */
export async function handlePaymentFailed(
	input: HandleWebhookPaymentInput,
): Promise<void> {
	const { paymentId, orderId, orderType } = input;

	if (orderType === "workshop") {
		const updated = await db
			.update(workshopOrders)
			.set({
				razorpayPaymentId: paymentId,
				paymentStatus: "failed",
				status: "payment_pending",
				updatedAt: new Date(),
			})
			.where(eq(workshopOrders.id, orderId))
			.returning();

		if (updated.length === 0) {
			console.error(`Workshop order not found: ${orderId}`);
		} else {
			console.log(`Workshop order payment failed: ${orderId}`);
		}
	} else {
		const updated = await db
			.update(orders)
			.set({
				razorpayPaymentId: paymentId,
				paymentStatus: "failed",
				status: "payment_pending",
				updatedAt: new Date(),
			})
			.where(eq(orders.id, orderId))
			.returning();

		if (updated.length === 0) {
			console.error(`Order not found: ${orderId}`);
		} else {
			console.log(`Order payment failed: ${orderId}`);
		}
	}
}

/**
 * Handles order.paid webhook event.
 */
export async function handleOrderPaid(
	orderId: string,
	orderType: OrderType,
): Promise<void> {
	if (orderType === "workshop") {
		const updated = await db
			.update(workshopOrders)
			.set({ status: "paid", updatedAt: new Date() })
			.where(eq(workshopOrders.id, orderId))
			.returning();

		if (updated.length === 0) {
			console.error(`Workshop order not found: ${orderId}`);
		}
	} else {
		const updated = await db
			.update(orders)
			.set({ status: "paid", updatedAt: new Date() })
			.where(eq(orders.id, orderId))
			.returning();

		if (updated.length === 0) {
			console.error(`Order not found: ${orderId}`);
		}
	}
}

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Sends order confirmation email in the background (fire-and-forget).
 */
function sendOrderConfirmationEmailAsync(orderId: string): void {
	db.query.orders
		.findFirst({
			where: eq(orders.id, orderId),
			columns: {
				id: true,
				total: true,
				deliveryCost: true,
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
		})
		.then((order) => {
			if (order) {
				return sendOrderConfirmationEmail(order);
			}
		})
		.catch((error) => {
			console.error(
				`Failed to send order confirmation email for order ${orderId}:`,
				error,
			);
		});
}
