import {
	and,
	count,
	desc,
	eq,
	inArray,
	isNotNull,
	not,
	sql,
} from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshopOrders, workshops } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const includeBookings = searchParams.get("includeBookings") === "true";

		const workshopsList = await db.query.workshops.findMany({
			where: and(
				eq(workshops.isDeleted, false),
				not(inArray(workshops.status, ["completed", "inactive"])),
			),
			orderBy: [desc(workshops.createdAt)],
		});

		if (!includeBookings) {
			return NextResponse.json({
				success: true,
				data: workshopsList,
			});
		}

		// Get slot counts for each workshop
		const workshopsWithBookings = await Promise.all(
			workshopsList.map(async (workshop) => {
				const [slotCount] = await db
					.select({
						totalSlots: sql<number>`coalesce(sum(${workshopOrders.slots}), 0)`,
						orderCount: count(),
					})
					.from(workshopOrders)
					.where(
						and(
							eq(workshopOrders.workshopId, workshop.id),
							eq(workshopOrders.isDeleted, false),
							isNotNull(workshopOrders.razorpayPaymentId),
						),
					);

				const currentBookings = slotCount.orderCount;
				const currentSlotsUsed = slotCount.totalSlots;
				const availableSlots = workshop.maxBookings - currentSlotsUsed;

				return {
					...workshop,
					currentBookings,
					availableSlots: Math.max(0, availableSlots),
				};
			}),
		);

		return NextResponse.json({
			success: true,
			data: workshopsWithBookings,
		});
	} catch (error) {
		console.error("Error fetching workshops:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch workshops" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id || session.user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const {
			title,
			description,
			amount,
			type,
			maxBookings,
			imageUrl,
			date,
			startTime,
			endTime,
		} = body;

		if (!title || !description || !amount || !type || !maxBookings) {
			return NextResponse.json(
				{ success: false, message: "Missing required fields" },
				{ status: 400 },
			);
		}

		if (!["online", "offline"].includes(type)) {
			return NextResponse.json(
				{ success: false, message: "Invalid workshop type" },
				{ status: 400 },
			);
		}

		// Date and time are required for new workshops
		if (!date || !startTime || !endTime) {
			return NextResponse.json(
				{
					success: false,
					message: "Date, start time, and end time are required",
				},
				{ status: 400 },
			);
		}

		// Validate date format (YYYY-MM-DD)
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return NextResponse.json(
				{ success: false, message: "Invalid date format. Expected YYYY-MM-DD" },
				{ status: 400 },
			);
		}

		// Validate the date is a real date
		const parsedDate = new Date(`${date}T12:00:00`);
		if (Number.isNaN(parsedDate.getTime())) {
			return NextResponse.json(
				{ success: false, message: "Invalid date value" },
				{ status: 400 },
			);
		}

		// Validate time format (HH:mm)
		const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
		if (!timeRegex.test(startTime)) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid start time format. Expected HH:mm (24-hour)",
				},
				{ status: 400 },
			);
		}
		if (!timeRegex.test(endTime)) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid end time format. Expected HH:mm (24-hour)",
				},
				{ status: 400 },
			);
		}

		// Validate end time is after start time
		if (endTime <= startTime) {
			return NextResponse.json(
				{ success: false, message: "End time must be after start time" },
				{ status: 400 },
			);
		}

		const [workshop] = await db
			.insert(workshops)
			.values({
				title,
				description,
				amount: amount.toString(),
				type,
				maxBookings: parseInt(maxBookings.toString()),
				imageUrl,
				date,
				startTime,
				endTime,
			})
			.returning();

		return NextResponse.json({
			success: true,
			data: workshop,
		});
	} catch (error) {
		console.error("Error creating workshop:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to create workshop" },
			{ status: 500 },
		);
	}
}
