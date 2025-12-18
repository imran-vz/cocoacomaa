import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
	createForbiddenResponse,
	createUnauthorizedResponse,
	requireAuth,
	requireSessionId,
} from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export async function GET(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		// Check authentication
		const session = await auth.api.getSession({ headers: await headers() });
		requireAuth(session);
		const userId = requireSessionId(session);

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
				userId: true, // Need userId for ownership check
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

		// Verify ownership OR admin/manager access
		const userRole = session?.user?.role;
		const isAdminOrManager = userRole === "admin" || userRole === "manager";

		if (order.userId !== userId && !isAdminOrManager) {
			return createForbiddenResponse(
				"You do not have permission to view this order",
			);
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
		if (error instanceof Error) {
			if (error.message.includes("Unauthorized")) {
				return createUnauthorizedResponse(error.message);
			}
			if (error.message.includes("Forbidden")) {
				return createForbiddenResponse(error.message);
			}
		}
		console.error("Error fetching order:", error);
		return NextResponse.json(
			{ error: "Failed to fetch order" },
			{ status: 500 },
		);
	}
}
