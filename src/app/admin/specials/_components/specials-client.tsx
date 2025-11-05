"use client";

import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { specialsColumns } from "@/components/desserts/specials-columns";
import { Button } from "@/components/ui/button";
import { type SpecialItem, useSpecials } from "@/hooks/use-specials";
import { cn } from "@/lib/utils";

type SpecialsClientProps = {
	initialData: SpecialItem[];
};

export function SpecialsClient({ initialData }: SpecialsClientProps) {
	const { data: specials, refetch, isRefetching } = useSpecials(initialData);

	return (
		<AdminPageLayout
			title="Specials"
			subtitle="Manage and track all specials"
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
						<Link href="/admin/specials/new">
							<Plus className="h-4 w-4" />
							Add Special
						</Link>
					</Button>
				</>
			}
			columns={specialsColumns}
			data={specials || []}
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
	);
}
