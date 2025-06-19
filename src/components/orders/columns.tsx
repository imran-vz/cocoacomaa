"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "@/components/orders/data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatCurrency, formatDate } from "@/lib/utils";

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
	userName: string;
}>[] = [
	{
		accessorKey: "id",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Order ID" />
		),
		cell: ({ row }) => (
			<div className="w-[80px] truncate">{row.getValue("id")}</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
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
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Created" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex w-[100px] items-center">
					<span className="whitespace-nowrap">
						{formatDate(row.getValue("createdAt"))}
					</span>
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
