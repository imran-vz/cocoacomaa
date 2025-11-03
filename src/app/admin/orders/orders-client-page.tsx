"use client";

import type { ReactNode } from "react";
import { FadeIn } from "@/components/fade-in";
import { columns } from "@/components/orders/columns";
import type { ExportData } from "@/components/orders/export-filter-dialog";
import ExportFilterDialog from "@/components/orders/export-filter-dialog";
import { DataTable } from "@/components/ui/data-table";
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
		<div className="container mx-auto p-4 sm:p-6">
			<FadeIn>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Manage and track all orders
						</p>
					</div>
					<ExportFilterDialog
						data={csvData}
						statuses={ORDER_STATUSES}
						orderTypes={ORDER_TYPES}
					/>
				</div>
			</FadeIn>

			<FadeIn delay={0.1}>
				<div className="rounded-md">
					<div className="overflow-x-auto">
						<DataTable
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
					</div>
				</div>
			</FadeIn>
		</div>
	);
}
