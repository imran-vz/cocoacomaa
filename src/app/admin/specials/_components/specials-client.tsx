"use client";

import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { specialsColumns } from "@/components/desserts/specials-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { type SpecialItem, useSpecials } from "@/hooks/use-specials";

type SpecialsClientProps = {
	initialData: SpecialItem[];
};

export function SpecialsClient({ initialData }: SpecialsClientProps) {
	const { data: specials, refetch, isRefetching } = useSpecials(initialData);

	return (
		<div className="container mx-auto px-4 sm:px-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<h1 className="text-3xl font-bold">Specials</h1>
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
						<Link href="/admin/specials/new">
							<Plus className="mr-2 h-4 w-4" />
							Add Special
						</Link>
					</Button>
				</div>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
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
				</div>
			</div>
		</div>
	);
}
