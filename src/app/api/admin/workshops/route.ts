import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workshopOrders, workshops } from "@/lib/db/schema";

export async function GET() {
	try {
		const workshopsWithSlotData = await db
			.select({
				id: workshops.id,
				title: workshops.title,
				description: workshops.description,
				imageUrl: workshops.imageUrl,
				amount: workshops.amount,
				type: workshops.type,
				maxBookings: workshops.maxBookings,
				status: workshops.status,
				createdAt: workshops.createdAt,
				currentSlotsUsed: sql<number>`coalesce(sum(case when ${workshopOrders.isDeleted} = false and ${workshopOrders.razorpayPaymentId} is not null then ${workshopOrders.slots} else 0 end), 0)`,
				currentBookings: sql<number>`coalesce(count(case when ${workshopOrders.isDeleted} = false and ${workshopOrders.razorpayPaymentId} is not null then 1 else null end), 0)`,
			})
			.from(workshops)
			.leftJoin(workshopOrders, eq(workshops.id, workshopOrders.workshopId))
			.where(eq(workshops.isDeleted, false))
			.groupBy(
				workshops.id,
				workshops.title,
				workshops.description,
				workshops.imageUrl,
				workshops.amount,
				workshops.type,
				workshops.maxBookings,
				workshops.status,
				workshops.createdAt,
			)
			.orderBy(desc(workshops.createdAt))
			.then((results) =>
				results.map((row) => ({
					...row,
					currentSlotsUsed: Number(row.currentSlotsUsed),
					currentBookings: Number(row.currentBookings),
					availableSlots: Math.max(
						0,
						row.maxBookings - Number(row.currentSlotsUsed),
					),
				})),
			);

		return NextResponse.json({ workshops: workshopsWithSlotData });
	} catch (error) {
		console.error("Error fetching workshops:", error);
		return NextResponse.json(
			{ error: "Failed to fetch workshops" },
			{ status: 500 },
		);
	}
}
