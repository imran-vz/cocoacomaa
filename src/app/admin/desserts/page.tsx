import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";
import { DessertsClient } from "./_components/desserts-client";

export default async function DessertsPage() {
	const dessertsList = await db.query.desserts.findMany({
		orderBy: (desserts, { desc }) => [desc(desserts.createdAt)],
		columns: {
			id: true,
			name: true,
			price: true,
			imageUrl: true,
			category: true,
			leadTimeDays: true,
			status: true,
			createdAt: true,
			containsEgg: true,
		},
		where: and(
			inArray(desserts.category, ["dessert", "cake"]),
			eq(desserts.isDeleted, false),
		),
	});

	return <DessertsClient initialData={dessertsList} />;
}
