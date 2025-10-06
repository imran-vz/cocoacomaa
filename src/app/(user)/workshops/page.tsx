import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { workshopOrders, workshops } from "@/lib/db/schema";
import WorkshopsClientPage from "./workshop-client-page";

export default async function WorkshopsPage() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login?redirect=/workshops");
	}

	const workshopsList = await db.query.workshops.findMany({
		where: eq(workshops.isDeleted, false),
		orderBy: [desc(workshops.createdAt)],
	});

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

	return <WorkshopsClientPage initialData={workshopsWithBookings} />;
}
