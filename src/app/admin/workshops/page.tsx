import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "@/components/workshops/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";

export default async function AdminWorkshopsPage() {
	const workshopsList = await db.query.workshops.findMany({
		orderBy: (workshops, { desc }) => [desc(workshops.createdAt)],
		columns: {
			id: true,
			title: true,
			description: true,
			amount: true,
			type: true,
			status: true,
			createdAt: true,
		},
	});

	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">Workshops</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage workshop offerings and registrations
					</p>
				</div>
				<Button asChild>
					<Link href="/admin/workshops/new">
						<Plus className="mr-2 h-4 w-4" />
						Add Workshop
					</Link>
				</Button>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
						columns={columns}
						data={workshopsList}
						searchKey="title"
						searchPlaceholder="Filter workshops..."
						filterableColumns={[
							{
								id: "type",
								title: "Type",
								options: [
									{ label: "Online", value: "online" },
									{ label: "Offline", value: "offline" },
								],
							},
							{
								id: "status",
								title: "Status",
								options: [
									{ label: "Active", value: "active" },
									{ label: "Inactive", value: "inactive" },
								],
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
