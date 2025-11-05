"use client";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
	columns,
	type WorkshopOrderWithAdditionalFields,
} from "@/components/workshop-orders/columns";

interface WorkshopOrdersClientProps {
	data: WorkshopOrderWithAdditionalFields[];
}

export function WorkshopOrdersClient({ data }: WorkshopOrdersClientProps) {
	return (
		<AdminPageLayout
			title="Workshop Orders"
			subtitle="View and manage all workshop registrations"
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
	);
}
