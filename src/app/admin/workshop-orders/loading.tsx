import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/workshop-orders/columns";

export default function WorkshopOrdersLoading() {
	return (
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
						data={[]}
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
						isLoading={true}
					/>
				</div>
			</div>
		</div>
	);
}
