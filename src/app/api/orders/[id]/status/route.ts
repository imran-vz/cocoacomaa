import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

const updateStatusSchema = z.object({
	status: z.enum([
		"pending",
		"payment_pending",
		"paid",
		"confirmed",
		"preparing",
		"ready",
		"completed",
		"cancelled",
	]),
});

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Validate request body
		const { success, data, error } = updateStatusSchema.safeParse(body);
		if (!success) {
			return NextResponse.json(
				{ error: "Invalid status", details: error.errors },
				{ status: 400 },
			);
		}

		const { status: newStatus } = data;

		// Get current order details before update
		const currentOrder = await db.query.orders.findFirst({
			where: eq(orders.id, id),
			columns: {
				id: true,
				status: true,
				total: true,
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
		});

		if (!currentOrder) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		// Check if status is actually changing
		if (currentOrder.status === newStatus) {
			return NextResponse.json({
				success: true,
				message: "Order status is already set to this value",
				order: { ...currentOrder, status: newStatus },
			});
		}

		// Update order status
		const updatedOrder = await db
			.update(orders)
			.set({
				status: newStatus,
				updatedAt: new Date(),
			})
			.where(eq(orders.id, id))
			.returning();

		if (updatedOrder.length === 0) {
			return NextResponse.json(
				{ error: "Failed to update order" },
				{ status: 500 },
			);
		}

		// Send status update email (in background)
		const orderDetailsForEmail = {
			...currentOrder,
			status: newStatus,
		};

		sendOrderStatusUpdateEmail(orderDetailsForEmail, currentOrder.status).catch(
			(emailError: unknown) => {
				console.error(
					`Failed to send status update email for order ${id}:`,
					emailError,
				);
			},
		);

		return NextResponse.json({
			success: true,
			message: "Order status updated successfully",
			order: updatedOrder[0],
			previousStatus: currentOrder.status,
			newStatus,
		});
	} catch (error) {
		console.error("Error updating order status:", error);
		return NextResponse.json(
			{ error: "Failed to update order status" },
			{ status: 500 },
		);
	}
}
