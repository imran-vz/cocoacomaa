import { db } from "@/lib/db";
import { PostalBrowniesClient } from "./_components/postal-brownies-client";

export default async function AdminPostalBrowniesPage() {
	const postalCombos = await db.query.postalCombos.findMany({
		where: (postalCombos, { eq }) => eq(postalCombos.isDeleted, false),
		orderBy: (postalCombos, { desc }) => [desc(postalCombos.createdAt)],
		columns: {
			id: true,
			name: true,
			description: true,
			price: true,
			imageUrl: true,
			createdAt: true,
			items: true,
			status: true,
			containsEgg: true,
		},
	});

	return <PostalBrowniesClient initialData={postalCombos} />;
}
