import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers, orders, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID || "",
	key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

interface OrderItem {
	id: number;
	name: string;
	price: number;
	quantity: number;
}

interface CreateOrderRequest {
	name: string;
	email: string;
	phone: string;
	pickupDate: string;
	pickupTime: string;
	items: OrderItem[];
	total: number;
}

export async function POST(request: NextRequest) {
	try {
		const body: CreateOrderRequest = await request.json();
		const { name, email, phone, pickupDate, pickupTime, items, total } = body;

		// Validate required fields
		if (
			!name ||
			!email ||
			!phone ||
			!pickupDate ||
			!pickupTime ||
			!items ||
			items.length === 0
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Start transaction
		const result = await db.transaction(async (tx) => {
			// Check if customer already exists
			const customer = await tx
				.select()
				.from(customers)
				.where(eq(customers.email, email))
				.limit(1);

			let customerId: number;

			if (customer.length === 0) {
				// Create new customer
				const newCustomer = await tx
					.insert(customers)
					.values({
						name,
						email,
						phone,
					})
					.returning({ id: customers.id });
				customerId = newCustomer[0].id;
			} else {
				customerId = customer[0].id;
				// Update customer info if different
				await tx
					.update(customers)
					.set({ name, phone, updatedAt: new Date() })
					.where(eq(customers.id, customerId));
			}

			// Create order
			// Combine pickup date and time into a single datetime
			const pickupDateObj = new Date(pickupDate);
			const [hours, minutes] = pickupTime.split(":");
			pickupDateObj.setHours(
				Number.parseInt(hours),
				Number.parseInt(minutes),
				0,
				0,
			);

			const newOrder = await tx
				.insert(orders)
				.values({
					customerId,
					total: total.toString(),
					status: "pending",
					paymentStatus: "pending",
					pickupDateTime: pickupDateObj,
				})
				.returning({ id: orders.id });

			const orderId = newOrder[0].id;

			// Create order items
			const orderItemsData = items.map((item) => ({
				orderId,
				dessertId: item.id,
				quantity: item.quantity,
				price: item.price.toString(),
			}));

			await tx.insert(orderItems).values(orderItemsData);

			return { orderId, customerId };
		});

		// Create Razorpay order
		const razorpayOrder = await razorpay.orders.create({
			amount: Math.round(total * 100), // Amount in paise
			currency: "INR",
			receipt: `order_${result.orderId}`,
			notes: {
				orderId: result.orderId.toString(),
				customerId: result.customerId.toString(),
				pickupDate,
				pickupTime,
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
			.where(eq(orders.id, result.orderId));

		return NextResponse.json({
			success: true,
			orderId: result.orderId,
			razorpayOrderId: razorpayOrder.id,
			amount: razorpayOrder.amount,
			currency: razorpayOrder.currency,
			key: process.env.RAZORPAY_KEY_ID,
		});
	} catch (error) {
		console.error("Error creating order:", error);
		return NextResponse.json(
			{ error: "Failed to create order" },
			{ status: 500 },
		);
	}
}
