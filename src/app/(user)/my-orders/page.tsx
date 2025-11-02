import { and, desc, eq, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { columns } from "./columns";
import { MyOrdersContent } from "./my-orders-content";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login");
	}

	const userOrders = await db.query.orders.findMany({
		where: and(
			eq(orders.userId, session.user.id),
			isNotNull(orders.razorpayPaymentId),
		),
		orderBy: desc(orders.createdAt),
		columns: {
			id: true,
			total: true,
			status: true,
			createdAt: true,
			pickupDateTime: true,
			orderType: true,
		},
		with: {
			orderItems: {
				columns: {
					itemType: true,
				},
				with: {
					dessert: {
						columns: {
							category: true,
						},
					},
				},
			},
		},
	});

	return <MyOrdersContent userOrders={userOrders} columns={columns} />;
}
