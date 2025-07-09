"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { DataTableRowActions } from "@/components/orders/data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatCurrency } from "@/lib/utils";

export const columns: ColumnDef<{
	id: string;
	total: string;
	status:
		| "completed"
		| "pending"
		| "payment_pending"
		| "paid"
		| "confirmed"
		| "preparing"
		| "ready"
		| "cancelled";
	orderType: "cake-orders" | "postal-brownies";
	userName: string;
	notes: string | null;
	orderDetails: ReactNode;
}>[] = [
	{
		accessorKey: "userName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Customer" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">
						{row.getValue("userName")}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "orderType",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Order Type" />
		),
		cell: ({ row }) => {
			const orderType = row.getValue("orderType") as string;
			return (
				<div className="flex w-[120px] items-center">
					<span className="capitalize">
						{orderType === "postal-brownies"
							? "Postal Brownies"
							: "Cake Orders"}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "total",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Total" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex w-[100px] items-center">
					<span>{formatCurrency(Number(row.getValue("total")) || 0)}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "notes",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Notes" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex w-[100px] truncate items-center">
					<span>{row.getValue("notes")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					variant={
						status === "completed"
							? "success"
							: status === "pending"
								? "destructive"
								: "secondary"
					}
					className="whitespace-nowrap"
				>
					{status}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "orderDetails",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Desserts/Combos" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex w-[100px] items-center">
					{row.getValue("orderDetails")}
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		id: "actions",
		cell: ({ row }) => <DataTableRowActions row={row} />,
	},
];
