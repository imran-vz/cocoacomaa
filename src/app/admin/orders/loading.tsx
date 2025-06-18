import { columns } from "@/components/orders/columns";
import { DataTable } from "@/components/ui/data-table";

export default function OrdersLoading() {
	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage and track all orders
					</p>
				</div>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
						columns={columns}
						data={[]}
						searchKey="userName"
						searchPlaceholder="Filter orders..."
						isLoading={true}
					/>
				</div>
			</div>
		</div>
	);
}
