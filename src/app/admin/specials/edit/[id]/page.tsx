import { notFound } from "next/navigation";
import { DessertForm } from "@/components/desserts/dessert-form";
import { db } from "@/lib/db";

interface EditSpecialPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditSpecialPage({
	params,
}: EditSpecialPageProps) {
	const { id } = await params;
	const specialId = Number.parseInt(id);

	if (Number.isNaN(specialId)) {
		notFound();
	}

	const special = await db.query.desserts.findFirst({
		where: (desserts, { eq, and }) =>
			and(
				eq(desserts.id, specialId),
				eq(desserts.category, "special"),
				eq(desserts.isDeleted, false),
			),
	});

	if (!special) {
		notFound();
	}

	return (
		<DessertForm
			mode="edit"
			initialData={{
				id: special.id,
				name: special.name,
				price: special.price,
				description: special.description,
				imageUrl: special.imageUrl || "",
				status: special.status,
				category: special.category,
				containsEgg: special.containsEgg,
				leadTimeDays: special.leadTimeDays || 2,
			}}
		/>
	);
}
