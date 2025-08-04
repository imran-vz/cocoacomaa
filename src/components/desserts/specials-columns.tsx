"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { SpecialActions } from "@/components/special-actions";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export type Special = {
	id: number;
	name: string;
	price: string;
	imageUrl: string | null;
	status: "available" | "unavailable";
	createdAt: Date;
};

export const specialsColumns: ColumnDef<Special>[] = [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "imageUrl",
		header: "Image",
		cell: ({ row }) => {
			const imageUrl = row.getValue("imageUrl") as string | null;
			return imageUrl ? (
				<div className="relative w-16 h-12">
					<Image
						src={imageUrl}
						alt={row.getValue("name") as string}
						fill
						className="object-cover rounded"
						sizes="64px"
					/>
				</div>
			) : (
				<div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
					No image
				</div>
			);
		},
	},
	{
		accessorKey: "price",
		header: "Price",
		cell: ({ row }) => {
			const price = row.getValue("price") as string;
			return formatCurrency(Number(price));
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge variant={status === "available" ? "default" : "destructive"}>
					{status === "available" ? "Available" : "Unavailable"}
				</Badge>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date;
			return new Date(date).toLocaleDateString();
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const special = row.original;
			return <SpecialActions id={special.id} />;
		},
	},
];
