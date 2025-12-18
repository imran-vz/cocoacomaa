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
		const { title, description, amount, type, maxBookings, imageUrl } = body;

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

		const [workshop] = await db
			.insert(workshops)
			.values({
				title,
				description,
				amount: amount.toString(),
				type,
				maxBookings: parseInt(maxBookings.toString()),
				imageUrl,
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
