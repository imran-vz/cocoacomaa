import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { db } from "@/lib/db";
import {
	addresses,
	customerContacts,
	orderItems,
	orders,
	users,
} from "@/lib/db/schema";
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
			// Gift order fields
			isGift = false,
			giftMessage,
			recipientName,
			recipientPhone,
			selectedRecipientContactId,
			recipientAddressLine1,
			recipientAddressLine2,
			recipientCity,
			recipientState,
			recipientZip,
		} = data;

		// Check if order contains special items
		const hasSpecials = items.some((item) => item.category === "special");

		// Combine pickup date and time into a single datetime
		let pickupDateObj: Date | null = null;

		if (hasSpecials) {
			// For special orders, use the customer-selected pickup date with the programmed time
			const currentSpecialsSettings = await db.query.specialsSettings.findFirst(
				{
					orderBy: (specialsSettings, { desc }) => [desc(specialsSettings.id)],
				},
			);

			if (currentSpecialsSettings?.isActive && pickupDate) {
				// Use customer-selected date within the allowed range
				pickupDateObj = new Date(pickupDate);
				// Use the start time for the pickup date/time
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

			// Handle gift order - create/update customer contact
			let recipientContactId: number | undefined;
			let finalAddressId = selectedAddressId;

			if (isGift && recipientName && recipientPhone) {
				// For gift orders, create recipient address and contact
				if (orderType === "postal-brownies" && recipientAddressLine1) {
					// Create recipient address
					const [newRecipientAddress] = await tx
						.insert(addresses)
						.values({
							userId: userId,
							addressLine1: recipientAddressLine1,
							addressLine2: recipientAddressLine2 || null,
							city: recipientCity || "",
							state: recipientState || "",
							zip: recipientZip || "",
						})
						.returning();

					finalAddressId = newRecipientAddress.id;

					// Check if contact already exists or create new
					if (selectedRecipientContactId) {
						// Get current contact to increment useCount
						const existingContact = await tx
							.select()
							.from(customerContacts)
							.where(eq(customerContacts.id, selectedRecipientContactId))
							.limit(1);

						if (existingContact.length > 0) {
							// Update existing contact usage
							await tx
								.update(customerContacts)
								.set({
									useCount: existingContact[0].useCount + 1,
									lastUsedAt: new Date(),
									updatedAt: new Date(),
								})
								.where(eq(customerContacts.id, selectedRecipientContactId));
							recipientContactId = selectedRecipientContactId;
						}
					} else {
						// Create new customer contact
						const [newContact] = await tx
							.insert(customerContacts)
							.values({
								userId: userId,
								name: recipientName,
								phone: recipientPhone,
								addressId: newRecipientAddress.id,
								useCount: 1,
								lastUsedAt: new Date(),
							})
							.returning();
						recipientContactId = newContact.id;
					}
				}
			}

			// Create order with gift fields
			const newOrder = await tx
				.insert(orders)
				.values({
					userId: userId,
					total: total.toString(),
					deliveryCost: (deliveryCost || 0).toString(),
					notes: isGift ? null : notes,
					status: "pending",
					paymentStatus: "pending",
					pickupDateTime: pickupDateObj || null,
					orderType: orderType,
					// Address fields for postal brownies
					addressId: finalAddressId,
					// Gift order fields
					isGift: isGift,
					giftMessage: giftMessage || null,
					recipientContactId: recipientContactId,
					// Recipient snapshot fields
					recipientName: isGift ? recipientName : null,
					recipientPhone: isGift ? recipientPhone : null,
					recipientAddressLine1:
						isGift && orderType === "postal-brownies"
							? recipientAddressLine1
							: null,
					recipientAddressLine2:
						isGift && orderType === "postal-brownies"
							? recipientAddressLine2
							: null,
					recipientCity:
						isGift && orderType === "postal-brownies" ? recipientCity : null,
					recipientState:
						isGift && orderType === "postal-brownies" ? recipientState : null,
					recipientZip:
						isGift && orderType === "postal-brownies" ? recipientZip : null,
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
