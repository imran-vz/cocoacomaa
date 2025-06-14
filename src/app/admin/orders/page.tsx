import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/orders/columns";

export default async function OrdersPage() {
	const ordersList = await db.query.orders.findMany({
		orderBy: desc(orders.createdAt),
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
