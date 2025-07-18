"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Mail, Phone, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export const columns: ColumnDef<{
	id: string;
	name: string | null;
	email: string;
	phone: string | null;
	role: string;
	createdAt: Date;
	orderCount: number;
	totalSpent: number;
	lastOrderDate: Date | null;
	displayName: string;
}>[] = [
	{
		accessorKey: "displayName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => {
			const name = row.getValue("displayName") as string;
			return (
				<div className="flex items-center space-x-2">
					<User className="h-4 w-4 text-muted-foreground" />
					<span className="max-w-[200px] truncate font-medium">{name}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "email",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Email" />
		),
		cell: ({ row }) => {
			const email = row.getValue("email") as string;
			return (
				<div className="flex items-center space-x-2">
					<Mail className="h-4 w-4 text-muted-foreground" />
					<span className="max-w-[250px] truncate">{email}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "phone",
		header: "Phone",
		cell: ({ row }) => {
			const phone = row.getValue("phone") as string | null;
			return (
				<div className="flex items-center space-x-2">
					<Phone className="h-4 w-4 text-muted-foreground" />
					<span className="max-w-[150px] truncate">
						{phone || "Not provided"}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "orderCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Orders" />
		),
		cell: ({ row }) => {
			const orderCount = row.getValue("orderCount") as number;
			return (
				<div className="flex w-[80px] items-center">
					<Badge variant={orderCount > 0 ? "secondary" : "outline"}>
						{orderCount}
					</Badge>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			const orderCount = row.getValue(id) as number;
			if (value.includes("active")) {
				return orderCount > 0;
			}
			if (value.includes("inactive")) {
				return orderCount === 0;
			}
			return true;
		},
	},
	{
		accessorKey: "totalSpent",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Total Spent" />
		),
		cell: ({ row }) => {
			const totalSpent = row.getValue("totalSpent") as number;
			return (
				<div className="flex w-[120px] items-center">
					<span
						className={totalSpent > 0 ? "font-medium" : "text-muted-foreground"}
					>
						{formatCurrency(totalSpent)}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Registered" />
		),
		cell: ({ row }) => {
			const createdAt = row.getValue("createdAt") as Date;
			return (
				<div className="flex items-center space-x-2">
					<Calendar className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm">{format(createdAt, "MMM d, yyyy")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "lastOrderDate",
		header: "Last Order",
		cell: ({ row }) => {
			const lastOrderDate = row.getValue("lastOrderDate") as Date | null;
			return (
				<div className="flex w-[120px] items-center">
					<span className="text-sm text-muted-foreground">
						{lastOrderDate ? format(lastOrderDate, "MMM d, yyyy") : "Never"}
					</span>
				</div>
			);
		},
	},
];
