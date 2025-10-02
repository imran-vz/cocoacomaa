"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, LinkIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatLocalDate, formatLocalTime } from "@/lib/format-timestamp";
import { formatCurrency } from "@/lib/utils";

// Helper function to check if order contains special desserts
function hasSpecialDesserts(
	orderItems: {
		itemType: string;
		dessert: { category: string } | null;
	}[],
): boolean {
	return orderItems.some(
		(item) =>
			item.itemType === "dessert" && item.dessert?.category === "special",
	);
}

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
	orderType: string;
	orderItems: Array<{
		itemType: string;
		dessert: {
			category: string;
		} | null;
	}>;
}>[] = [
	{
		id: "id",
		accessorKey: "id",
		header: "Order ID",
		cell: ({ row }) => {
			const isSpecial = hasSpecialDesserts(row.original.orderItems);
			return (
				<div className="flex items-center gap-2">
					<Button variant="link" asChild size="sm">
						<Link href={`/order/${row.original.id}`}>
							<span className="font-mono text-xs hover:underline inline-flex flex-nowrap gap-2">
								{row.original.id.slice(-8).toUpperCase()}{" "}
								<LinkIcon className="w-4 h-4" />
							</span>
						</Link>
					</Button>
					{isSpecial && (
						<Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs px-2 py-0.5">
							Special
						</Badge>
					)}
				</div>
			);
		},
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: "Placed On",
		cell: ({ row }) => formatDateTime(row.original.createdAt),
	},
	{
		id: "pickupDateTime",
		accessorKey: "pickupDateTime",
		header: "Pickup",
		cell: ({ row }) => {
			const isPostal = row.original.orderType === "postal-brownies";
			const isSpecial = hasSpecialDesserts(row.original.orderItems);

			if (isPostal) {
				return <span className="text-muted-foreground">Delivery</span>;
			}

			if (row.original.pickupDateTime) {
				return (
					<div className="flex flex-col">
						<span className={isSpecial ? "text-purple-700 font-medium" : ""}>
							{formatLocalDate(row.original.pickupDateTime)}
						</span>
						<span
							className={`text-xs ${isSpecial ? "text-purple-600" : "text-muted-foreground"}`}
						>
							{formatLocalTime(row.original.pickupDateTime)}
						</span>
					</div>
				);
			}

			return <span className="text-muted-foreground">-</span>;
		},
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
