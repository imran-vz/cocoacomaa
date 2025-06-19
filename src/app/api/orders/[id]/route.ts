import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export async function GET(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		if (!id) {
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
		}

		const order = await db.query.orders.findFirst({
			where: eq(orders.id, id),
			columns: {
				id: true,
				total: true,
				status: true,
				paymentStatus: true,
				pickupDateTime: true,
				createdAt: true,
				razorpayOrderId: true,
				razorpayPaymentId: true,
				notes: true,
			},
			with: {
				user: {
					columns: {
						name: true,
						email: true,
						phone: true,
					},
				},
				orderItems: {
					with: {
						dessert: {
							columns: {
								name: true,
								description: true,
								price: true,
							},
						},
					},
				},
			},
		});

		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			order: {
				...order,
				items: order.orderItems,
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
