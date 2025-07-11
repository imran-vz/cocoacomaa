import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { WorkshopForm } from "@/components/workshops/workshop-form";
import { db } from "@/lib/db";
import { workshops } from "@/lib/db/schema";

interface EditWorkshopPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditWorkshopPage({
	params,
}: EditWorkshopPageProps) {
	const { id } = await params;
	const workshop = await db.query.workshops.findFirst({
		where: eq(workshops.id, parseInt(id, 10)),
	});

	if (!workshop) {
		notFound();
	}

	return (
		<WorkshopForm
			mode="edit"
			initialData={{
				id: workshop.id,
				title: workshop.title,
				description: workshop.description,
				amount: workshop.amount,
				type: workshop.type as "online" | "offline",
				status: workshop.status as "active" | "inactive",
			}}
		/>
	);
}
