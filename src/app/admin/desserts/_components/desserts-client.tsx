"use client";

import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { columns } from "@/components/desserts/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { type DessertItem, useDesserts } from "@/hooks/use-desserts";

type DessertsClientProps = {
	initialData: DessertItem[];
};

export function DessertsClient({ initialData }: DessertsClientProps) {
	const { data: desserts, refetch, isRefetching } = useDesserts(initialData);

	return (
		<div className="container mx-auto px-4 sm:px-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<h1 className="text-3xl font-bold">Desserts</h1>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => refetch()}
						disabled={isRefetching}
					>
						<RefreshCw
							className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
						/>
						Refetch
					</Button>
					<Button asChild>
						<Link href="/admin/desserts/new">
							<Plus className="mr-2 h-4 w-4" />
							Add Dessert
						</Link>
					</Button>
				</div>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
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
				</div>
			</div>
		</div>
	);
}
