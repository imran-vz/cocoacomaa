import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { specialsColumns } from "@/components/desserts/specials-columns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SpecialsLoading() {
	return (
		<AdminPageLayout
			title="Specials"
			subtitle="Manage and track all specials"
			actions={
				<>
					<Button variant="outline" disabled={true}>
						<RefreshCw className={cn("h-4 w-4 animate-spin")} />
						Refetch
					</Button>
					<Button asChild>
						<Link href="/admin/specials/new">
							<Plus className="h-4 w-4" />
							Add Special
						</Link>
					</Button>
				</>
			}
			columns={specialsColumns}
			data={[]}
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
			isLoading={true}
		/>
	);
}
