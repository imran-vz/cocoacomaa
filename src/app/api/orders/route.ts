import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { db } from "@/lib/db";
import { orderItems, orders, users, specialsSettings } from "@/lib/db/schema";
import { checkoutFormSchemaDB } from "@/lib/schema";

const razorpay = new Razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
	key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: NextRequest) {
	try {
		const { success, data, error } = checkoutFormSchemaDB.safeParse(
			await request.json(),
		);

		if (!success) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const {
			name,
			email,
			phone,
			pickupDate,
			pickupTime,
			items,
			total,
			deliveryCost,
			notes,
			orderType,
			selectedAddressId,
		} = data;

		// Check if order contains special items
		const hasSpecials = items.some((item) => item.category === "special");

		// Combine pickup date and time into a single datetime
		let pickupDateObj: Date | null = null;

		if (hasSpecials) {
			// For special orders, use the programmed pickup date/time from settings
			const currentSpecialsSettings = await db.query.specialsSettings.findFirst(
				{
					orderBy: (specialsSettings, { desc }) => [desc(specialsSettings.id)],
				},
			);

			if (currentSpecialsSettings && currentSpecialsSettings.isActive) {
				pickupDateObj = new Date(currentSpecialsSettings.pickupDate);
				// Use the start time for the snapshot (admin can configure the window)
				const [hours, minutes] =
					currentSpecialsSettings.pickupStartTime.split(":");
				pickupDateObj.setHours(
					Number.parseInt(hours),
					Number.parseInt(minutes),
					0,
					0,
				);
			}
		} else if (pickupDate && pickupTime) {
			// For regular orders, use customer-selected pickup date/time
			pickupDateObj = new Date(pickupDate);
			const [hours, minutes] = pickupTime.split(":");
			pickupDateObj.setHours(
				Number.parseInt(hours),
				Number.parseInt(minutes),
				0,
				0,
			);
		}

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
					deliveryCost: (deliveryCost || 0).toString(),
					notes: notes,
					status: "pending",
					paymentStatus: "pending",
					pickupDateTime: pickupDateObj || null,
					orderType: orderType,
					// Address fields for postal brownies
					addressId: selectedAddressId,
				})
				.returning({ id: orders.id });

			const orderId = newOrder[0].id;

			// Create order items - handle both desserts and postal combos
			const orderItemsData = items.map((item) => {
				// Determine item type based on order type and item structure
				const isPostalCombo = orderType === "postal-brownies";

				return {
					orderId,
					itemType: isPostalCombo
						? ("postal-combo" as const)
						: ("dessert" as const),
					dessertId: isPostalCombo ? undefined : item.id,
					postalComboId: isPostalCombo ? item.id : undefined,
					quantity: item.quantity,
					price: item.price.toString(),
					itemName: item.name,
				};
			});

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
				pickupDatetime: pickupDateObj ? pickupDateObj.toISOString() : "",
				orderType: orderType,
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
