"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { calculateNetAmount } from "@/lib/calculateGrossAmount";
import { config } from "@/lib/config";

export type WorkshopOrder = {
	id: string;
	amount: string;
	status: "pending" | "payment_pending" | "paid" | "confirmed" | "cancelled";
	paymentStatus:
		| "pending"
		| "created"
		| "authorized"
		| "captured"
		| "refunded"
		| "failed";
	createdAt: Date;
	workshopTitle: string;
	workshopType: "online" | "offline";
	customerName: string;
	customerEmail: string;
	customerPhone: string;
};

const getStatusColor = (status: string) => {
	switch (status) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "payment_pending":
			return "bg-orange-100 text-orange-800 border-orange-200";
		case "paid":
		case "confirmed":
			return "bg-green-100 text-green-800 border-green-200";
		case "cancelled":
			return "bg-red-100 text-red-800 border-red-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

const formatStatus = (status: string) => {
	return status
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export const columns: ColumnDef<WorkshopOrder>[] = [
	{
		accessorKey: "workshopType",
		header: "Workshop Type",
		cell: ({ row }) => {
			const type = row.getValue("workshopType") as string;
			return (
				<Badge
					variant={type === "online" ? "default" : "secondary"}
					className="text-xs mt-1"
				>
					{type}
				</Badge>
			);
		},
	},
	{
		accessorKey: "workshopTitle",
		header: "Workshop",
		cell: ({ row }) => {
			const title = row.getValue("workshopTitle") as string;
			return <div className="font-medium">{title}</div>;
		},
	},
	{
		accessorKey: "customerName",
		header: "Customer",
		cell: ({ row }) => {
			const name = row.getValue("customerName") as string;
			const email = row.original.customerEmail;
			const phone = row.original.customerPhone;
			return (
				<div>
					<div className="font-medium">{name}</div>
					<div className="text-sm text-muted-foreground">{email}</div>
					{phone !== "Not provided" && (
						<div className="text-sm text-muted-foreground">{phone}</div>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) => {
			const amount = row.getValue("amount") as string;
			const netAmount = calculateNetAmount(
				Number(amount),
				config.paymentProcessingFee,
			);
			const gatewayCost = Number(amount) - netAmount;

			return (
				<div className="text-sm">
					<div className="font-medium">{formatCurrency(Number(amount))}</div>
					<div className="text-xs text-muted-foreground">
						Base: {formatCurrency(netAmount)} + Fee:{" "}
						{formatCurrency(gatewayCost)}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge className={getStatusColor(status)}>{formatStatus(status)}</Badge>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Registered",
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date;
			return (
				<div>
					<div>{format(date, "MMM d, yyyy")}</div>
					<div className="text-sm text-muted-foreground">
						{format(date, "h:mm a")}
					</div>
				</div>
			);
		},
	},
];
