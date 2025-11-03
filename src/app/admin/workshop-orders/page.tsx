import { and, desc, eq, isNotNull } from "drizzle-orm";
import { FadeIn } from "@/components/fade-in";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/workshop-orders/columns";
import { db } from "@/lib/db";
import { workshopOrders } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminWorkshopOrdersPage() {
	const ordersList = await db.query.workshopOrders.findMany({
		where: and(
			eq(workshopOrders.isDeleted, false),
			isNotNull(workshopOrders.razorpayPaymentId),
		),
		orderBy: [desc(workshopOrders.createdAt)],
		columns: {
			id: true,
			amount: true,
			status: true,
			paymentStatus: true,
			createdAt: true,
			slots: true,
		},
		with: {
			workshop: {
				columns: {
					id: true,
					title: true,
					type: true,
				},
			},
			user: {
				columns: {
					id: true,
					name: true,
					email: true,
					phone: true,
				},
			},
		},
	});

	const data = ordersList.map((order) => ({
		...order,
		workshopTitle: order.workshop.title,
		workshopType: order.workshop.type,
		customerName: order.user.name || "No name",
		customerEmail: order.user.email,
		customerPhone: order.user.phone || "Not provided",
	}));

	return (
		<FadeIn>
			<div className="container mx-auto p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold">Workshop Orders</h1>
						<p className="text-sm text-muted-foreground mt-1">
							View and manage all workshop registrations
						</p>
					</div>
				</div>

				<div className="rounded-md">
					<div className="overflow-x-auto">
						<DataTable
							columns={columns}
							data={data}
							searchKey="customerName"
							searchPlaceholder="Search by customer name..."
							filterableColumns={[
								{
									id: "status",
									title: "Status",
									options: [
										{ label: "Pending", value: "pending" },
										{ label: "Payment Pending", value: "payment_pending" },
										{ label: "Paid", value: "paid" },
										{ label: "Confirmed", value: "confirmed" },
										{ label: "Cancelled", value: "cancelled" },
									],
								},
								{
									id: "workshopType",
									title: "Workshop Type",
									options: [
										{ label: "Online", value: "online" },
										{ label: "Offline", value: "offline" },
									],
								},
							]}
						/>
					</div>
				</div>
			</div>
		</FadeIn>
	);
}
