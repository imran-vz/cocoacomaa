import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/db";
import { orderItems, orders, users } from "@/lib/db/schema";
import { z } from "zod";

const razorpay = new Razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
	key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const checkoutFormSchema = z.object({
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	phone: z
		.string()
		.min(10, {
			message: "Phone number must be at least 10 digits.",
		})
		.regex(/^[0-9+\-\s()]+$/, {
			message: "Please enter a valid phone number.",
		}),
	pickupDate: z.coerce.date({
		required_error: "Please select a pickup date.",
	}),
	pickupTime: z.string().min(1, {
		message: "Please select a pickup time.",
	}),
	notes: z
		.string()
		.max(25, {
			message: "Notes must be less than 25 characters.",
		})
		.optional(),
	items: z.array(
		z.object({
			id: z.number(),
			name: z.string(),
			price: z.number(),
			quantity: z.number(),
		}),
	),
	total: z.number(),
});

export async function POST(request: NextRequest) {
	try {
		const { success, data, error } = checkoutFormSchema.safeParse(
			await request.json(),
		);

		if (!success) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const { name, email, phone, pickupDate, pickupTime, items, total, notes } =
			data;

		// Combine pickup date and time into a single datetime
		const pickupDateObj = new Date(pickupDate);
		const [hours, minutes] = pickupTime.split(":");
		pickupDateObj.setHours(
			Number.parseInt(hours),
			Number.parseInt(minutes),
			0,
			0,
		);

		// Start transaction
		const result = await db.transaction(async (tx) => {
			// Check if customer already exists
			const user = await tx
				.select()
				.from(users)
				.where(eq(users.email, email))
				.limit(1);

			if (user.length === 0) {
				// Create new customer
				throw new Error("User not found");
			}

			const userId = user[0].id;
			// Update customer info if different
			await tx
				.update(users)
				.set({ name, phone, role: "customer", updatedAt: new Date() })
				.where(eq(users.id, userId));

			// Create order

			const newOrder = await tx
				.insert(orders)
				.values({
					userId: userId,
					total: total.toString(),
					notes: notes,
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

			return { orderId, userId };
		});

		// Create Razorpay order
		const razorpayOrder = await razorpay.orders.create({
			amount: Math.round(total * 100), // Amount in paise
			currency: "INR",
			receipt: `order_${result.orderId}`,
			notes: {
				orderId: result.orderId.toString(),
				userId: result.userId.toString(),
				pickupDatetime: pickupDateObj.toISOString(),
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
		});
	} catch (error) {
		console.error("Error creating order:", error);
		return NextResponse.json(
			{ error: "Failed to create order" },
			{ status: 500 },
		);
	}
}
