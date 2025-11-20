import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from ".";
import { workshopOrders } from "./schema";

export type MyWorkshopOrder = Awaited<
	ReturnType<typeof getMyWorkshopOrders>
>[number];

export async function getMyWorkshopOrders(userId: string) {
	return await db.query.workshopOrders.findMany({
		where: and(
			isNotNull(workshopOrders.razorpayPaymentId),
			eq(workshopOrders.userId, userId),
			eq(workshopOrders.isDeleted, false),
		),
		columns: {
			id: true,
			createdAt: true,
			amount: true,
			slots: true,
			status: true,
			paymentStatus: true,
			notes: true,
		},
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
}
