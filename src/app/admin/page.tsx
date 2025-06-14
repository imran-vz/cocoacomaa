import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { DataTable } from "@/components/desserts/data-table";
import { columns } from "@/components/desserts/columns";

export default async function AdminDashboard() {
	const dessertsList = await db.query.desserts.findMany({
		where: eq(desserts.status, "available"),
		orderBy: desc(desserts.createdAt),
	});

	return (
		<div className="container mx-auto py-10">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Dessert Management</h1>
				<Link href="/admin/desserts/new">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Dessert
					</Button>
				</Link>
			</div>

			<DataTable columns={columns} data={dessertsList} />
		</div>
	);
}
