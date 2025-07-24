import { desc, eq, and, isNotNull, count } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { workshops, workshopOrders } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const includeBookings = searchParams.get("includeBookings") === "true";

		const workshopsList = await db.query.workshops.findMany({
			where: eq(workshops.isDeleted, false),
			orderBy: [desc(workshops.createdAt)],
		});

		if (!includeBookings) {
			return NextResponse.json({
				success: true,
				data: workshopsList,
			});
		}

		// Get booking counts for each workshop
		const workshopsWithBookings = await Promise.all(
			workshopsList.map(async (workshop) => {
				const [bookingCount] = await db
					.select({ count: count() })
					.from(workshopOrders)
					.where(
						and(
							eq(workshopOrders.workshopId, workshop.id),
							eq(workshopOrders.isDeleted, false),
							isNotNull(workshopOrders.razorpayPaymentId),
						),
					);

				const currentBookings = bookingCount.count;
				const availableSlots = workshop.maxBookings - currentBookings;

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
		const session = await auth();
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
