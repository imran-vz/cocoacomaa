import { desc, isNotNull } from "drizzle-orm";
import { columns } from "@/components/orders/columns";
import ExportButton from "@/components/orders/export-button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { type Order, orders } from "@/lib/db/schema";
import { ShoppingCart, Clock, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const statuses: { label: string; value: Order["status"] }[] = [
	{
		label: "Pending",
		value: "pending",
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
		where: isNotNull(orders.razorpayPaymentId),
		orderBy: desc(orders.createdAt),
		columns: {
			id: true,
			total: true,
			status: true,
			orderType: true,
			notes: true,
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

	// Calculate overview metrics
	const totalOrders = ordersList.length;
	const pendingOrders = ordersList.filter(
		(order) => order.status !== "completed" && order.status !== "cancelled",
	).length;
	const completedOrders = ordersList.filter(
		(order) => order.status === "completed",
	).length;

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
				<ExportButton data={csvData} />
			</div>

			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-3 mb-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Orders</CardTitle>
						<ShoppingCart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalOrders}</div>
						<p className="text-xs text-muted-foreground">All paid orders</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Orders
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">
							{pendingOrders}
						</div>
						<p className="text-xs text-muted-foreground">Awaiting processing</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Completed Orders
						</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{completedOrders}
						</div>
						<p className="text-xs text-muted-foreground">
							Successfully delivered
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
						columns={columns}
						data={ordersList.map((order) => ({
							...order,
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
