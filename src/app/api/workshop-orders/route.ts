import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";
import { calculateNetAmount } from "@/lib/calculateGrossAmount";
import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { workshopOrders, workshops } from "@/lib/db/schema";

const razorpay = new Razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
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
				isNotNull(workshopOrders.razorpayPaymentId),
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
		const { workshopId, notes, slots } = body;

		if (!workshopId) {
			return NextResponse.json(
				{ success: false, message: "Workshop ID is required" },
				{ status: 400 },
			);
		}

		// Get workshop details first to validate slots based on type
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

		// Set slots based on workshop type
		let actualSlots: number;
		if (workshop.type === "online") {
			// Online workshops always get 1 slot, ignore any slots parameter
			actualSlots = 1;
		} else {
			// Offline workshops require valid slots parameter
			if (!Number.isInteger(slots) || slots < 1 || slots > 2) {
				return NextResponse.json(
					{
						success: false,
						message: "Slots must be between 1 and 2 for offline workshops",
					},
					{ status: 400 },
				);
			}
			actualSlots = slots;
		}

		// Check existing bookings for this user and workshop
		const existingOrders = await db.query.workshopOrders.findMany({
			where: and(
				eq(workshopOrders.userId, session.user.id),
				eq(workshopOrders.workshopId, workshopId),
				eq(workshopOrders.isDeleted, false),
				isNotNull(workshopOrders.razorpayPaymentId),
			),
		});

		const totalUserSlots = existingOrders.reduce(
			(sum, order) => sum + (order.slots || 1),
			0,
		);

		// Check if user would exceed maximum slots (1 for online, 2 for offline)
		const maxSlotsAllowed = workshop.type === "online" ? 1 : 2;

		if (totalUserSlots + actualSlots > maxSlotsAllowed) {
			return NextResponse.json(
				{
					success: false,
					message:
						workshop.type === "online"
							? `Online workshops allow only 1 slot per person. You currently have ${totalUserSlots} slot${totalUserSlots > 1 ? "s" : ""}.`
							: `You can only book up to 2 slots total. You currently have ${totalUserSlots} slot${totalUserSlots > 1 ? "s" : ""}.`,
				},
				{ status: 400 },
			);
		}

		// Check if workshop has available slots
		const [totalSlotsUsed] = await db
			.select({
				totalSlots: sql<number>`coalesce(sum(${workshopOrders.slots}), 0)`,
			})
			.from(workshopOrders)
			.where(
				and(
					eq(workshopOrders.workshopId, workshopId),
					eq(workshopOrders.isDeleted, false),
					isNotNull(workshopOrders.razorpayPaymentId),
				),
			);

		const currentSlotsUsed = totalSlotsUsed.totalSlots;
		const availableSlots = workshop.maxBookings - currentSlotsUsed;

		if (availableSlots < actualSlots) {
			return NextResponse.json(
				{
					success: false,
					message: `Sorry, only ${availableSlots} slot${availableSlots !== 1 ? "s" : ""} remaining. You requested ${actualSlots} slot${actualSlots > 1 ? "s" : ""}.`,
				},
				{ status: 400 },
			);
		}

		// Calculate gateway cost based on slots
		const workshopAmount = Number(workshop.amount);
		const grossAmount = workshopAmount * actualSlots;
		const netAmount = calculateNetAmount(
			grossAmount,
			config.paymentProcessingFee,
		);
		const gatewayCost = grossAmount - netAmount;

		// Create workshop order
		const [order] = await db
			.insert(workshopOrders)
			.values({
				userId: session.user.id,
				workshopId: workshopId,
				slots: actualSlots,
				amount: grossAmount.toString(),
				gatewayCost: gatewayCost.toString(),
				status: "payment_pending",
				notes: notes || null,
			})
			.returning();

		// Create Razorpay order
		const razorpayOrder = await razorpay.orders.create({
			amount: Math.round(grossAmount * 100), // Convert to paise
			currency: "INR",
			receipt: `workshop_${order.id}`,
			notes: {
				orderId: order.id.toString(),
				userId: session.user.id.toString(),
				workshopId: workshopId.toString(),
				slots: actualSlots.toString(),
				orderType: "workshop",
			},
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
