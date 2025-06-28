import { desc, eq } from "drizzle-orm";
import { columns } from "@/components/orders/columns";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { type Order, orders } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const statuses: { label: string; value: Order["status"] }[] = [
	{
		label: "Payment Pending",
		value: "payment_pending",
	},
	{
		label: "Preparing",
		value: "preparing",
	},
	{
		label: "Completed",
		value: "completed",
	},
	{
		label: "Paid",
		value: "paid",
	},
	{
		label: "Cancelled",
		value: "cancelled",
	},
	{
		label: "Ready",
		value: "ready",
	},
];

export default async function OrdersPage() {
	const ordersList = await db.query.orders.findMany({
		orderBy: desc(orders.createdAt),
		where: eq(orders.status, "paid"),
		columns: {
			id: true,
			total: true,
			status: true,
			createdAt: true,
			notes: true,
		},
		with: {
			user: {
				columns: {
					name: true,
				},
			},
		},
	});

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
						data={ordersList.map((order) => ({
							...order,
							userName: order.user.name || "",
						}))}
						searchKey="userName"
						searchPlaceholder="Filter orders..."
						filterableColumns={[
							{
								id: "status",
								title: "Status",
								options: statuses,
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
