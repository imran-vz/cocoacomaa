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
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { workshopOrders, workshops } from "@/lib/db/schema";
import WorkshopsClientPage from "./workshop-client-page";

export const metadata: Metadata = {
	title: "Baking Workshops in Bengaluru | Learn from Experts",
	description:
		"Join hands-on baking workshops in Koramangala, Bengaluru. Learn to make fudgy brownies, custom cakes, and desserts from expert bakers. Book your spot today!",
	keywords: [
		"baking workshops bengaluru",
		"brownie making class",
		"cake baking workshop koramangala",
		"dessert classes bengaluru",
		"learn baking bengaluru",
		"hands-on baking class",
	],
	openGraph: {
		title: "Baking Workshops in Bengaluru | Learn from Experts | Cocoa Comaa",
		description:
			"Join hands-on baking workshops in Koramangala. Learn to make brownies, cakes, and desserts from experts.",
	},
};

export default async function WorkshopsPage() {
	const session = await auth();

	const workshopsList = await db.query.workshops.findMany({
		where: and(
			eq(workshops.isDeleted, false),
			not(inArray(workshops.status, ["completed", "inactive"])),
		),
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

	return (
		<WorkshopsClientPage
			initialData={workshopsWithBookings}
			isAuthenticated={!!session?.user?.id}
		/>
	);
}
