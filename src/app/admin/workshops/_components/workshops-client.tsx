"use client";

import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { Button } from "@/components/ui/button";
import { columns } from "@/components/workshops/columns";
import { useWorkshops, type WorkshopWithSlotData } from "@/hooks/use-workshops";
import { cn } from "@/lib/utils";

type WorkshopsClientProps = {
	initialData: WorkshopWithSlotData[];
};

export function WorkshopsClient({ initialData }: WorkshopsClientProps) {
	const { data: workshops, refetch, isRefetching } = useWorkshops(initialData);

	return (
		<AdminPageLayout
			title="Workshops"
			subtitle="Manage workshop offerings and registrations"
			actions={
				<>
					<Button
						variant="outline"
						onClick={() => refetch()}
						disabled={isRefetching}
					>
						<RefreshCw
							className={cn("h-4 w-4", isRefetching ? "animate-spin" : "")}
						/>
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
			columns={columns}
			data={workshops || []}
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
	);
}
