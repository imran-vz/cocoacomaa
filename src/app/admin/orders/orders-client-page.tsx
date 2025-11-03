"use client";

import type { ReactNode } from "react";
import { FadeIn } from "@/components/fade-in";
import { columns } from "@/components/orders/columns";
import ExportFilterDialog from "@/components/orders/export-filter-dialog";
import { DataTable } from "@/components/ui/data-table";
import type { Order } from "@/lib/db/schema";

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

type OrderData = {
	id: string;
	total: string;
	status: Order["status"];
	orderType: Order["orderType"];
	notes: string | null;
	createdAt: Date;
	userName: string;
	orderDetails: ReactNode;
};

type CsvData = {
	orderId: string;
	itemName: string;
	customerName: string;
	customerPhone: string;
	address: string;
	message: string | null;
	status: Order["status"];
	orderType: Order["orderType"];
	createdAt: Date;
};

interface OrdersClientPageProps {
	ordersList: OrderData[];
	csvData: CsvData[];
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
						statuses={statuses}
						orderTypes={orderTypes}
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
			</FadeIn>
		</div>
	);
}
