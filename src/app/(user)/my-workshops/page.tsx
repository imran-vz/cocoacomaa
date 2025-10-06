import { and, desc, eq, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { workshopOrders } from "@/lib/db/schema";
import MyWorkshopPage from "./my-workshop-page";

export default async function Page() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login?redirect=/my-workshops");
	}

	const ordersList = await db.query.workshopOrders.findMany({
		where: and(
			isNotNull(workshopOrders.razorpayPaymentId),
			eq(workshopOrders.userId, session.user.id),
			eq(workshopOrders.isDeleted, false),
		),
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

	return <MyWorkshopPage initialData={ordersList} />;
}
