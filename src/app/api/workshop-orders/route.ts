import { and, eq, isNotNull, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { calculateNetAmount } from "@/lib/calculateGrossAmount";
import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { workshopOrders, workshops } from "@/lib/db/schema";
import { getMyWorkshopOrders } from "@/lib/db/workshop-order";
import { createRazorpayOrder } from "@/lib/payment/payment-service";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
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

		const ordersList = await getMyWorkshopOrders(filterUserId);

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
		const session = await auth.api.getSession({ headers: await headers() });
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

		// ─── Use a DB transaction with row locking to prevent race conditions ───
		// Without locking, two concurrent requests can both read "1 slot available"
		// and both successfully book, resulting in overbooking.
		//
		// The SELECT ... FOR UPDATE on the workshops row ensures that only one
		// transaction can check + insert at a time. The second transaction will
		// block until the first commits or rolls back.
		const order = await db.transaction(async (tx) => {
			// Step 1: Lock the workshop row for the duration of this transaction.
			// This prevents concurrent bookings from reading stale slot counts.
			const [workshop] = await tx.execute<{
				id: number;
				title: string;
				description: string;
				amount: string;
				type: "online" | "offline";
				max_bookings: number;
				image_url: string | null;
				status: "active" | "inactive" | "completed";
				is_deleted: boolean;
				created_at: Date;
				updated_at: Date;
			}>(
				sql`SELECT * FROM ${workshops}
					WHERE ${workshops.id} = ${workshopId}
					AND ${workshops.isDeleted} = false
					AND ${workshops.status} = 'active'
					FOR UPDATE`,
			);

			if (!workshop) {
				throw new WorkshopError("Workshop not found or inactive", 404);
			}

			// Step 2: Determine actual slots based on workshop type
			let actualSlots: number;
			if (workshop.type === "online") {
				// Online workshops always get 1 slot, ignore any slots parameter
				actualSlots = 1;
			} else {
				// Offline workshops require valid slots parameter
				if (!Number.isInteger(slots) || slots < 1 || slots > 2) {
					throw new WorkshopError(
						"Slots must be between 1 and 2 for offline workshops",
						400,
					);
				}
				actualSlots = slots;
			}

			// Step 3: Check existing bookings for this user and workshop
			// (within the same transaction so the row lock is held)
			const existingOrders = await tx.query.workshopOrders.findMany({
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
				throw new WorkshopError(
					workshop.type === "online"
						? `Online workshops allow only 1 slot per person. You currently have ${totalUserSlots} slot${totalUserSlots > 1 ? "s" : ""}.`
						: `You can only book up to 2 slots total. You currently have ${totalUserSlots} slot${totalUserSlots > 1 ? "s" : ""}.`,
					400,
				);
			}

			// Step 4: Check if workshop has available slots (also within locked tx)
			const [totalSlotsUsed] = await tx
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
			const availableSlots = workshop.max_bookings - currentSlotsUsed;

			if (availableSlots < actualSlots) {
				throw new WorkshopError(
					`Sorry, only ${availableSlots} slot${availableSlots !== 1 ? "s" : ""} remaining. You requested ${actualSlots} slot${actualSlots > 1 ? "s" : ""}.`,
					400,
				);
			}

			// Step 5: Calculate gateway cost based on slots
			const workshopAmount = Number(workshop.amount);
			const grossAmount = workshopAmount * actualSlots;
			const netAmount = calculateNetAmount(
				grossAmount,
				config.paymentProcessingFee,
			);
			const gatewayCost = grossAmount - netAmount;

			// Step 6: Insert the order (still within the locked transaction)
			const [newOrder] = await tx
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

			return { order: newOrder, grossAmount };
		});

		// Step 7: Create Razorpay order using shared service (outside transaction)
		// This is done outside the transaction so the row lock is released quickly.
		// If Razorpay order creation fails, the workshop order stays in "payment_pending"
		// which is safe — the user can retry.
		const razorpayResult = await createRazorpayOrder({
			orderId: order.order.id,
			amount: order.grossAmount,
			orderType: "workshop",
			notes: {
				userId: session.user.id.toString(),
				workshopId: workshopId.toString(),
				slots: (order.order.slots || 1).toString(),
			},
		});

		return NextResponse.json({
			success: true,
			orderId: order.order.id,
			razorpayOrderId: razorpayResult.razorpayOrderId,
			amount: razorpayResult.amount,
			currency: razorpayResult.currency,
		});
	} catch (error) {
		// Handle our known error type with proper status codes
		if (error instanceof WorkshopError) {
			return NextResponse.json(
				{ success: false, message: error.message },
				{ status: error.statusCode },
			);
		}

		console.error("Error creating workshop order:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to create workshop order" },
			{ status: 500 },
		);
	}
}

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Custom error class for workshop-specific validation failures.
 * Allows throwing with a specific HTTP status code from within the transaction
 * and catching it in the outer handler to return the correct response.
 */
class WorkshopError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = "WorkshopError";
		this.statusCode = statusCode;
	}
}
