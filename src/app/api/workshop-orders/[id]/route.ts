import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshopOrders } from "@/lib/db/schema";

export async function GET(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		if (!id) {
			return NextResponse.json(
				{ error: "Order ID is required" },
				{ status: 400 },
			);
		}

		// Get the workshop order
		const order = await db
			.select()
			.from(workshopOrders)
			.where(
				and(
					eq(workshopOrders.id, id),
					eq(workshopOrders.userId, session.user.id),
				),
			)
			.limit(1);

		if (order.length === 0) {
			return NextResponse.json(
				{ error: "Workshop order not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			order: {
				orderId: order[0].id,
				razorpayOrderId: order[0].razorpayOrderId,
				amount: Number(order[0].amount),
				workshopId: order[0].workshopId,
				status: order[0].status,
			},
		});
	} catch (error) {
		console.error("Error fetching workshop order:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
