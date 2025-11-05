"use client";

import type { ReactNode } from "react";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { columns } from "@/components/orders/columns";
import type { ExportData } from "@/components/orders/export-filter-dialog";
import ExportFilterDialog from "@/components/orders/export-filter-dialog";
import type { Order } from "@/lib/db/schema";
import { ORDER_STATUSES, ORDER_TYPES } from "@/lib/orders/constants";

type OrderData = Pick<
	Order,
	"id" | "total" | "status" | "orderType" | "notes" | "createdAt"
> & {
	userName: string;
	orderDetails: ReactNode;
};

interface OrdersClientPageProps {
	ordersList: OrderData[];
	csvData: ExportData[];
}

export default function OrdersClientPage({
	ordersList,
	csvData,
}: OrdersClientPageProps) {
	return (
		<AdminPageLayout
			title="Orders"
			subtitle="Manage and track all orders"
			actions={
				<ExportFilterDialog
					data={csvData}
					statuses={ORDER_STATUSES}
					orderTypes={ORDER_TYPES}
				/>
			}
			columns={columns}
			data={ordersList}
			searchKey="userName"
			searchPlaceholder="Filter orders..."
			filterableColumns={[
				{
					id: "status",
					title: "Status",
					options: ORDER_STATUSES,
				},
				{
					id: "orderType",
					title: "Order Type",
					options: ORDER_TYPES,
				},
			]}
		/>
	);
}
