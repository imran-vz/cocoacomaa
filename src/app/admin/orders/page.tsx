import { desc, isNotNull } from "drizzle-orm";
import { columns } from "@/components/orders/columns";
import ExportFilterDialog from "@/components/orders/export-filter-dialog";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { type Order, orders } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const statuses: { label: string; value: Order["status"] }[] = [
	{ label: "Pending", value: "pending" },
	{ label: "Paid", value: "paid" },
	{ label: "Confirmed", value: "confirmed" },
	{ label: "Preparing", value: "preparing" },
	{ label: "Ready", value: "ready" },
	{ label: "Completed", value: "completed" },
	{ label: "Cancelled", value: "cancelled" },
];

const orderTypes: { label: string; value: Order["orderType"] }[] = [
	{ label: "Cake Orders", value: "cake-orders" },
	{ label: "Postal Brownies", value: "postal-brownies" },
	{ label: "Specials", value: "specials" },
];

export default async function OrdersPage() {
	const ordersList = await db.query.orders.findMany({
		where: isNotNull(orders.razorpayPaymentId),
		orderBy: desc(orders.createdAt),
		columns: {
			id: true,
			total: true,
			status: true,
			orderType: true,
			notes: true,
			createdAt: true,
		},
		with: {
			orderItems: {
				with: {
					postalCombo: {
						columns: {
							name: true,
						},
					},
					dessert: {
						columns: {
							id: true,
							name: true,
						},
					},
				},
			},
			user: {
				columns: {
					name: true,
					phone: true,
				},
			},
			address: {
				columns: {
					addressLine1: true,
					addressLine2: true,
					city: true,
					state: true,
					zip: true,
				},
			},
		},
	});

	// Prepare CSV export data
	const csvData = ordersList.flatMap((order) => {
		const customerName = order.user.name || "No name";
		const customerPhone = order.user.phone || "No phone";

		// Format address
		let address = "No address";
		if (order.address) {
			const addressParts = [
				order.address.addressLine1,
				order.address.addressLine2,
				order.address.city,
				order.address.state,
				order.address.zip,
			].filter(Boolean);
			address = addressParts.join(", ");
		}

		// Create a row for each order item
		return order.orderItems.map((item) => ({
			orderId: order.id,
			itemName: item.postalCombo?.name || item.dessert?.name || "Unknown item",
			customerName,
			customerPhone,
			address,
			message: order.notes,
			status: order.status,
			orderType: order.orderType,
			createdAt: new Date(order.createdAt),
		}));
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
				<ExportFilterDialog
					data={csvData}
					statuses={statuses}
					orderTypes={orderTypes}
				/>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
						columns={columns}
						data={ordersList.map((order) => ({
							...order,
							userName: order.user.name || "",
							orderDetails: (
								<div className="space-y-1">
									{order.orderItems.map((item) => {
										if (item.postalCombo) {
											return (
												<p key={item.postalCombo.name}>
													{item.postalCombo.name}
												</p>
											);
										}

										if (item.dessert) {
											return (
												<p key={item.dessert.id}>
													{item.dessert.name} - {item.quantity}
												</p>
											);
										}

										return null;
									})}
								</div>
							),
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
