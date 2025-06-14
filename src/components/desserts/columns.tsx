"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DessertActions } from "@/components/dessert-actions";
import { formatCurrency } from "@/lib/utils";

export type Dessert = {
	id: number;
	name: string;
	price: string;
	createdAt: Date;
};

export const columns: ColumnDef<Dessert>[] = [
	{
		accessorKey: "name",
		header: "Name",
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
			const dessert = row.original;
			return <DessertActions id={dessert.id} />;
		},
	},
];
