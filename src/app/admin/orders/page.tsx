import { desc } from "drizzle-orm";
import { columns } from "@/components/orders/columns";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { type Order, orders } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const statuses: { label: string; value: Order["status"] }[] = [
	{
		label: "Pending",
		value: "pending",
	},
	{
		label: "Payment Pending",
		value: "payment_pending",
	},
	{
		label: "Paid",
		value: "paid",
	},
	{
		label: "Confirmed",
		value: "confirmed",
	},
	{
		label: "Preparing",
		value: "preparing",
	},
	{
		label: "Ready",
		value: "ready",
	},
	{
		label: "Completed",
		value: "completed",
	},
	{
		label: "Cancelled",
		value: "cancelled",
	},
];

const orderTypes: { label: string; value: Order["orderType"] }[] = [
	{
		label: "Cake Orders",
		value: "cake-orders",
	},
	{
		label: "Postal Brownies",
		value: "postal-brownies",
	},
];

export default async function OrdersPage() {
	const ordersList = await db.query.orders.findMany({
		orderBy: desc(orders.createdAt),
		columns: {
			id: true,
			total: true,
			status: true,
			orderType: true,
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
							{
								id: "orderType",
								title: "Order Type",
								options: orderTypes,
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
