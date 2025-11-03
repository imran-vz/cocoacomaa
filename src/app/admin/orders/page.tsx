import { desc, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import OrdersClientPage from "./orders-client-page";

export const dynamic = "force-dynamic";

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
		<OrdersClientPage
			ordersList={ordersList.map((order) => ({
				...order,
				userName: order.user.name || "",
				orderDetails: (
					<div className="space-y-1">
						{order.orderItems.map((item) => {
							if (item.postalCombo) {
								return (
									<p key={item.postalCombo.name}>{item.postalCombo.name}</p>
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
			csvData={csvData}
		/>
	);
}
