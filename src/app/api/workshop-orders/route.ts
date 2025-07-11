import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { workshopOrders, workshops } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID || "",
	key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function GET(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		// If admin is requesting, allow filtering by userId
		// If regular user, only show their own orders
		const isAdmin = session.user.role === "admin";
		const filterUserId = isAdmin && userId ? userId : session.user.id;

		const ordersList = await db.query.workshopOrders.findMany({
			where: and(
				eq(workshopOrders.userId, filterUserId),
				eq(workshopOrders.isDeleted, false),
			),
			orderBy: [desc(workshopOrders.createdAt)],
			with: {
				workshop: true,
				user: {
					columns: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
			},
		});

		return NextResponse.json({
			success: true,
			data: ordersList,
		});
	} catch (error) {
		console.error("Error fetching workshop orders:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch workshop orders" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const { workshopId, notes } = body;

		if (!workshopId) {
			return NextResponse.json(
				{ success: false, message: "Workshop ID is required" },
				{ status: 400 },
			);
		}

		// Get workshop details
		const workshop = await db.query.workshops.findFirst({
			where: and(
				eq(workshops.id, workshopId),
				eq(workshops.isDeleted, false),
				eq(workshops.status, "active"),
			),
		});

		if (!workshop) {
			return NextResponse.json(
				{ success: false, message: "Workshop not found or inactive" },
				{ status: 404 },
			);
		}

		// Check if user already has an order for this workshop
		const existingOrder = await db.query.workshopOrders.findFirst({
			where: and(
				eq(workshopOrders.userId, session.user.id),
				eq(workshopOrders.workshopId, workshopId),
				eq(workshopOrders.isDeleted, false),
			),
		});

		if (existingOrder) {
			return NextResponse.json(
				{
					success: false,
					message: "You have already registered for this workshop",
				},
				{ status: 400 },
			);
		}

		// Create workshop order
		const [order] = await db
			.insert(workshopOrders)
			.values({
				userId: session.user.id,
				workshopId: workshopId,
				amount: workshop.amount,
				status: "payment_pending",
				notes: notes || null,
			})
			.returning();

		// Create Razorpay order
		const razorpayOrder = await razorpay.orders.create({
			amount: Math.round(Number(workshop.amount) * 100), // Convert to paise
			currency: "INR",
			receipt: `workshop_${order.id}`,
		});

		// Update order with Razorpay order ID
		await db
			.update(workshopOrders)
			.set({
				razorpayOrderId: razorpayOrder.id,
				paymentStatus: "created",
			})
			.where(eq(workshopOrders.id, order.id));

		return NextResponse.json({
			success: true,
			orderId: order.id,
			razorpayOrderId: razorpayOrder.id,
			amount: Number(workshop.amount) * 100,
			currency: "INR",
		});
	} catch (error) {
		console.error("Error creating workshop order:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to create workshop order" },
			{ status: 500 },
		);
	}
}
