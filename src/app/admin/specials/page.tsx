import { Plus } from "lucide-react";
import Link from "next/link";

import { specialsColumns } from "@/components/desserts/specials-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";

export default async function SpecialsPage() {
	const specialsList = await db.query.desserts.findMany({
		where: (desserts, { eq }) => eq(desserts.category, "special"),
		orderBy: (desserts, { desc }) => [desc(desserts.createdAt)],
		columns: {
			id: true,
			name: true,
			price: true,
			imageUrl: true,
			status: true,
			createdAt: true,
		},
	});

	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<h1 className="text-3xl font-bold">Specials</h1>
				<Button asChild>
					<Link href="/admin/specials/new">
						<Plus className="mr-2 h-4 w-4" />
						Add Special
					</Link>
				</Button>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
						columns={specialsColumns}
						data={specialsList}
						searchKey="name"
						searchPlaceholder="Filter Specials..."
						filterableColumns={[
							{
								id: "status",
								title: "Status",
								options: [
									{ label: "Available", value: "available" },
									{ label: "Unavailable", value: "unavailable" },
								],
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
