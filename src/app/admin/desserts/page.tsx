import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/desserts/columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function DessertsPage() {
	const dessertsList = await db.query.desserts.findMany({
		orderBy: (desserts, { desc }) => [desc(desserts.createdAt)],
		columns: {
			id: true,
			name: true,
			price: true,
			createdAt: true,
		},
	});

	return (
		<div className="container mx-auto py-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">Desserts</h1>
				<Button asChild>
					<Link href="/admin/desserts/new">
						<Plus className="mr-2 h-4 w-4" />
						Add Dessert
					</Link>
				</Button>
			</div>
			<DataTable columns={columns} data={dessertsList} />
		</div>
	);
}
