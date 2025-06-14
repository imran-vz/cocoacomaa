import { columns } from "@/components/orders/columns";
import { DataTable } from "@/components/ui/data-table";

export default function OrdersLoading() {
	return (
		<div className="container mx-auto py-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">Orders</h1>
			</div>

			<DataTable columns={columns} data={[]} isLoading={true} />
		</div>
	);
}
