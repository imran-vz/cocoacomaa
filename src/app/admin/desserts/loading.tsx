import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { columns } from "@/components/desserts/columns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DessertsLoading() {
	return (
		<AdminPageLayout
			title="Desserts"
			subtitle="Manage and track all desserts"
			actions={
				<>
					<Button variant="outline" disabled={true}>
						<RefreshCw className={cn("h-4 w-4 animate-spin")} />
						Refetch
					</Button>
					<Button asChild>
						<Link href="/admin/desserts/new">
							<Plus className="h-4 w-4" />
							Add Dessert
						</Link>
					</Button>
				</>
			}
			columns={columns}
			data={[]}
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
			isLoading={true}
		/>
	);
}
