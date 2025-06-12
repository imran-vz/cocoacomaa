import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, customers, orderItems, desserts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const orderId = params.id;

		if (!orderId) {
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
		}

		// Fetch order with customer and order items
		const orderData = await db
			.select({
				id: orders.id,
				total: orders.total,
				status: orders.status,
				paymentStatus: orders.paymentStatus,
				pickupDateTime: orders.pickupDateTime,
				createdAt: orders.createdAt,
				razorpayOrderId: orders.razorpayOrderId,
				razorpayPaymentId: orders.razorpayPaymentId,
				notes: orders.notes,
				customerName: customers.name,
				customerEmail: customers.email,
				customerPhone: customers.phone,
			})
			.from(orders)
			.innerJoin(customers, eq(orders.customerId, customers.id))
			.where(eq(orders.id, orderId))
			.limit(1);

		if (orderData.length === 0) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		// Fetch order items with dessert details
		const items = await db
			.select({
				quantity: orderItems.quantity,
				price: orderItems.price,
				dessertName: desserts.name,
				dessertDescription: desserts.description,
			})
			.from(orderItems)
			.innerJoin(desserts, eq(orderItems.dessertId, desserts.id))
			.where(eq(orderItems.orderId, orderId));

		const order = orderData[0];

		return NextResponse.json({
			success: true,
			order: {
				...order,
				items,
				pickupDate: order.pickupDateTime
					? order.pickupDateTime.toISOString().split("T")[0]
					: null,
				pickupTime: order.pickupDateTime
					? order.pickupDateTime.toLocaleTimeString("en-US", {
							hour12: false,
							hour: "2-digit",
							minute: "2-digit",
						})
					: null,
			},
		});
	} catch (error) {
		console.error("Error fetching order:", error);
		return NextResponse.json(
			{ error: "Failed to fetch order" },
			{ status: 500 },
		);
	}
}
