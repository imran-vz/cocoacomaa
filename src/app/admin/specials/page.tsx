import { FadeIn } from "@/components/fade-in";
import { db } from "@/lib/db";
import { SpecialsClient } from "./_components/specials-client";

export default async function SpecialsPage() {
	const specialsList = await db.query.desserts.findMany({
		where: (desserts, { eq, and }) =>
			and(eq(desserts.category, "special"), eq(desserts.isDeleted, false)),
		orderBy: (desserts, { desc }) => [desc(desserts.createdAt)],
		columns: {
			id: true,
			name: true,
			price: true,
			imageUrl: true,
			status: true,
			createdAt: true,
			containsEgg: true,
		},
	});

	return (
		<FadeIn>
			<SpecialsClient initialData={specialsList} />
		</FadeIn>
	);
}
