import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DessertForm } from "@/components/desserts/dessert-form";
import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";

interface EditDessertPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditDessertPage({
	params,
}: EditDessertPageProps) {
	const { id } = await params;
	const dessert = await db.query.desserts.findFirst({
		where: and(
			eq(desserts.id, Number.parseInt(id, 10)),
			eq(desserts.isDeleted, false),
		),
		columns: {
			id: true,
			name: true,
			price: true,
			description: true,
			imageUrl: true,
			status: true,
			category: true,
			containsEgg: true,
			leadTimeDays: true,
		},
	});
	if (!dessert) {
		notFound();
	}

	return (
		<DessertForm
			mode="edit"
			initialData={{
				id: dessert.id,
				name: dessert.name,
				price: dessert.price,
				description: dessert.description,
				imageUrl: dessert.imageUrl || "",
				status: dessert.status,
				category: dessert.category,
				containsEgg: dessert.containsEgg,
				leadTimeDays: dessert.leadTimeDays,
			}}
		/>
	);
}
