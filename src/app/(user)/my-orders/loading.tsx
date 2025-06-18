import { LoadingDataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default function MyOrdersLoading() {
	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-2xl md:text-3xl font-bold mb-6">My Orders</h1>
			<LoadingDataTable columns={columns} rowCount={5} />
		</div>
	);
}
