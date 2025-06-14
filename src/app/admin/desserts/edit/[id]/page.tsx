import { DessertForm } from "@/components/desserts/dessert-form";
import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

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
		where: eq(desserts.id, Number.parseInt(id, 10)),
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
				status: dessert.status as "available" | "unavailable",
			}}
		/>
	);
}
