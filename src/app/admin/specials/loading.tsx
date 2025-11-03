import { Plus } from "lucide-react";
import { specialsColumns } from "@/components/desserts/specials-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

export default function SpecialsLoading() {
	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<h1 className="text-3xl font-bold">Specials</h1>
				<Button disabled>
					<Plus className="mr-2 h-4 w-4" />
					Add Special
				</Button>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
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
				</div>
			</div>
		</div>
	);
}
