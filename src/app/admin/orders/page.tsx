import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/orders/columns";

export default async function OrdersPage() {
	const ordersList = await db.query.orders.findMany({
		orderBy: desc(orders.createdAt),
		columns: {
			id: true,
			total: true,
			status: true,
			createdAt: true,
		},
		with: {
			customer: {
				columns: {
					name: true,
				},
			},
		},
	});

	return (
		<div className="container mx-auto py-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">Orders</h1>
			</div>
			<DataTable
				columns={columns}
				data={ordersList.map((order) => ({
					...order,
					customerName: order.customer.name,
				}))}
			/>
		</div>
	);
}
