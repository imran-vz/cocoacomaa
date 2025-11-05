import { Link, Plus, RefreshCw } from "lucide-react";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { Button } from "@/components/ui/button";
import { columns } from "@/components/workshops/columns";
import { cn } from "@/lib/utils";

export default function WorkshopsLoading() {
	return (
		<AdminPageLayout
			title="Workshops"
			subtitle="Manage workshop offerings and registrations"
			columns={columns}
			data={[]}
			actions={
				<>
					<Button variant="outline" disabled={true}>
						<RefreshCw className={cn("h-4 w-4 animate-spin")} />
						Refetch
					</Button>
					<Button asChild>
						<Link href="/admin/workshops/new">
							<Plus className="h-4 w-4" />
							Add Workshop
						</Link>
					</Button>
				</>
			}
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
			isLoading={true}
		/>
	);
}
