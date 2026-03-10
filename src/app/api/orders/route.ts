import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
	createUnauthorizedResponse,
	requireAuth,
	requireSessionId,
} from "@/lib/auth-utils";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import { orderItems, orders, users } from "@/lib/db/schema";
import {
	createRazorpayOrder,
	type OrderType,
} from "@/lib/payment/payment-service";
import { checkoutFormSchemaDB } from "@/lib/schema";

export async function POST(request: NextRequest) {
	try {
		// Authenticate the request
		const session = await auth.api.getSession({ headers: await headers() });
		requireAuth(session);
		const userId = requireSessionId(session);

		// Validate CSRF token
		await validateCsrfToken(request);

		const { success, data, error } = checkoutFormSchemaDB.safeParse(
			await request.json(),
		);

		if (!success) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const {
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
			// For special orders, use the customer-selected pickup date with the programmed time
			const currentSpecialsSettings = await db.query.specialsSettings.findFirst(
				{
					orderBy: (specialsSettings, { desc }) => [desc(specialsSettings.id)],
				},
			);

			if (currentSpecialsSettings?.isActive && pickupDate) {
				pickupDateObj = new Date(pickupDate);
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
			// Verify user exists
			const user = await tx
				.select()
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (user.length === 0) {
				throw new Error("User not found");
			}

			// Update customer info
			await tx
				.update(users)
				.set({ name: data.name, phone: data.phone, updatedAt: new Date() })
				.where(eq(users.id, userId));

			// Create order
			const newOrder = await tx
				.insert(orders)
				.values({
					userId,
					total: total.toString(),
					deliveryCost: (deliveryCost || 0).toString(),
					notes,
					status: "pending",
					paymentStatus: "pending",
					pickupDateTime: pickupDateObj || null,
					orderType,
					addressId: selectedAddressId,
				})
				.returning({ id: orders.id });

			const orderId = newOrder[0].id;

			// Create order items
			const orderItemsData = items.map((item) => {
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

			return { orderId };
		});

		// Create Razorpay order using shared service
		const razorpayResult = await createRazorpayOrder({
			orderId: result.orderId,
			amount: total,
			orderType: orderType as OrderType,
			notes: {
				userId,
				pickupDatetime: pickupDateObj ? pickupDateObj.toISOString() : "",
			},
		});

		return NextResponse.json({
			success: true,
			orderId: result.orderId,
			razorpayOrderId: razorpayResult.razorpayOrderId,
			amount: razorpayResult.amount,
			currency: razorpayResult.currency,
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
		console.error("Error creating order:", error);
		return NextResponse.json(
			{ error: "Failed to create order" },
			{ status: 500 },
		);
	}
}
