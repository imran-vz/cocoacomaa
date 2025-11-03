import { and, eq, inArray } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "@/components/desserts/columns";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";

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

	return (
		<FadeIn>
			<div className="container mx-auto p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<h1 className="text-3xl font-bold">Desserts</h1>
					<Button asChild>
						<Link href="/admin/desserts/new">
							<Plus className="mr-2 h-4 w-4" />
							Add Dessert
						</Link>
					</Button>
				</div>

				<div className="rounded-md">
					<div className="overflow-x-auto">
						<DataTable
							columns={columns}
							data={dessertsList}
							searchKey="name"
							searchPlaceholder="Filter Desserts..."
							filterableColumns={[
								{
									id: "category",
									title: "Category",
									options: [
										{ label: "Cake", value: "cake" },
										{ label: "Dessert", value: "dessert" },
										{ label: "Special", value: "special" },
									],
								},
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
		</FadeIn>
	);
}
