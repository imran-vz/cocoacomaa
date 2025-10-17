"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import type { Order } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const orderTypeMap: Record<Order["orderType"], string> = {
	"cake-orders": "Cake Orders",
	"postal-brownies": "Postal Brownies",
	specials: "Specials",
};

export const columns: ColumnDef<
	Pick<Order, "id" | "total" | "status" | "orderType" | "notes"> & {
		userName: string;
		orderDetails: ReactNode;
	}
>[] = [
	{
		accessorKey: "id",
		header: "Order ID",
		cell: ({ row }) => {
			return (
				<div className="flex w-[100px] items-center">
					<span>{String(row.getValue("id"))?.slice(-8).toUpperCase()}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "userName",
		header: "Customer",
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
		header: "Order Type",
		cell: ({ row }) => {
			const orderType = row.getValue("orderType") as Order["orderType"];
			return (
				<div className="flex w-[120px] items-center">
					<span className="capitalize">{orderTypeMap[orderType]}</span>
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
		accessorKey: "orderDetails",
		header: "Desserts/Combos",
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
		accessorKey: "notes",
		header: "Notes",
		cell: ({ row }) => {
			const notes = row.getValue("notes") as string;
			if (!notes) return null;
			return (
				<div className="flex w-[100px] items-center">
					<Tooltip>
						<TooltipTrigger>
							<span>{notes.slice(0, 10)}...</span>
						</TooltipTrigger>
						<TooltipContent>
							<p>{notes}</p>
						</TooltipContent>
					</Tooltip>
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
		id: "actions",
		cell: ({ row }) => {
			const router = useRouter();
			const order = row.original.id;
			return (
				<div className="flex w-[100px] items-center">
					<Button
						onClick={() => router.push(`/admin/orders/${order}`)}
						variant="ghost"
					>
						<Eye className="mr-2 h-4 w-4" />
						View
					</Button>
				</div>
			);
		},
	},
];
