import { and, desc, eq, isNotNull } from "drizzle-orm";
import { WorkshopOrdersClient } from "@/app/admin/workshop-orders/workshop-orders-client";
import { db } from "@/lib/db";
import { workshopOrders } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminWorkshopOrdersPage() {
	const ordersList = await db.query.workshopOrders.findMany({
		where: and(
			eq(workshopOrders.isDeleted, false),
			isNotNull(workshopOrders.razorpayPaymentId),
		),
		orderBy: [desc(workshopOrders.createdAt)],
		columns: {
			id: true,
			amount: true,
			status: true,
			paymentStatus: true,
			createdAt: true,
			slots: true,
		},
		with: {
			workshop: {
				columns: {
					id: true,
					title: true,
					type: true,
				},
			},
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

	const data = ordersList.map((order) => ({
		...order,
		workshopTitle: order.workshop.title,
		workshopType: order.workshop.type,
		customerName: order.user.name || "No name",
		customerEmail: order.user.email,
		customerPhone: order.user.phone || "Not provided",
	}));

	return <WorkshopOrdersClient data={data} />;
}
