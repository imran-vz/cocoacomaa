"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { EyeIcon, LinkIcon } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<{
	id: string;
	status:
		| "pending"
		| "payment_pending"
		| "paid"
		| "confirmed"
		| "preparing"
		| "ready"
		| "completed"
		| "cancelled";
	createdAt: Date;
	total: string;
	pickupDateTime: Date | null;
}>[] = [
	{
		id: "id",
		accessorKey: "id",
		header: "Order ID",
		cell: ({ row }) => (
			<Button variant="link" asChild size="sm">
				<Link href={`/order/${row.original.id}`}>
					<span className="font-mono text-xs hover:underline inline-flex flex-nowrap gap-2">
						{row.original.id.slice(-8).toUpperCase()}{" "}
						<LinkIcon className="w-4 h-4" />
					</span>
				</Link>
			</Button>
		),
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: "Placed On",
		cell: ({ row }) => format(row.original.createdAt, "PPP p"),
	},
	{
		id: "pickupDateTime",
		accessorKey: "pickupDateTime",
		header: "Pickup",
		cell: ({ row }) =>
			row.original.pickupDateTime ? (
				format(row.original.pickupDateTime, "PPP p")
			) : (
				<span className="text-muted-foreground">-</span>
			),
	},
	{
		id: "total",
		accessorKey: "total",
		header: "Total",
		cell: ({ row }) => formatCurrency(Number(row.original.total)),
	},
	{
		id: "status",
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<span className="capitalize">
				{row.original.status.replace(/_/g, " ")}
			</span>
		),
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<div className="flex justify-end ">
				<Button variant="outline" asChild size="sm">
					<Link href={`/order/${row.original.id}`}>
						<EyeIcon className="w-4 h-4 mr-2" /> View Order
					</Link>
				</Button>
			</div>
		),
	},
];
