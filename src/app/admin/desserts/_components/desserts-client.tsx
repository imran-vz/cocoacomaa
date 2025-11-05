"use client";

import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { columns } from "@/components/desserts/columns";
import { Button } from "@/components/ui/button";
import { type DessertItem, useDesserts } from "@/hooks/use-desserts";
import { cn } from "@/lib/utils";

type DessertsClientProps = {
	initialData: DessertItem[];
};

export function DessertsClient({ initialData }: DessertsClientProps) {
	const { data: desserts, refetch, isRefetching } = useDesserts(initialData);

	return (
		<AdminPageLayout
			title="Desserts"
			subtitle="Manage and track all desserts"
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
						<Link href="/admin/desserts/new">
							<Plus className="h-4 w-4" />
							Add Dessert
						</Link>
					</Button>
				</>
			}
			columns={columns}
			data={desserts || []}
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
	);
}
