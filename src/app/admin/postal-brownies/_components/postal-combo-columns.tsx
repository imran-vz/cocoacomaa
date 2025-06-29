"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatCurrency } from "@/lib/utils";
import DeletePostalComboButton from "./delete-postal-combo-button";

export type PostalCombo = {
	id: number;
	name: string;
	description: string;
	price: string;
	imageUrl: string | null;
	createdAt: Date;
	items: string[];
	status: "available" | "unavailable";
	comboType: string;
};

export const postalComboColumns: ColumnDef<PostalCombo>[] = [
	{
		accessorKey: "imageUrl",
		header: "Image",
		cell: ({ row }) => {
			const combo = row.original;
			return (
				<div className="flex items-center justify-center">
					{combo.imageUrl ? (
						<Image
							src={combo.imageUrl}
							width={40}
							height={40}
							alt={combo.name}
							className="w-8 sm:w-10 h-8 sm:h-10 object-cover rounded-md border"
						/>
					) : (
						<div className="w-8 sm:w-10 h-8 sm:h-10 bg-muted rounded-md border flex items-center justify-center">
							<ImageIcon className="h-3 sm:h-4 w-3 sm:w-4 text-muted-foreground" />
						</div>
					)}
				</div>
			);
		},
		enableSorting: false,
	},
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => {
			const combo = row.original;
			return (
				<div className="space-y-1 min-w-0">
					<div className="font-medium text-sm sm:text-base truncate">
						{combo.name}
					</div>
					<div className="hidden sm:block text-xs sm:text-sm text-muted-foreground line-clamp-2 max-w-80 truncate">
						{combo.description}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "comboType",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Type" />
		),
		cell: ({ row }) => {
			const comboType = row.getValue("comboType") as string;
			return (
				<Badge variant="outline" className="capitalize">
					{comboType}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "price",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Price" />
		),
		cell: ({ row }) => {
			const price = row.getValue("price") as string;
			return <div className="font-mono">{formatCurrency(Number(price))}</div>;
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
				<Badge variant={status === "available" ? "default" : "secondary"}>
					{status}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "items",
		header: "Items",
		cell: ({ row }) => {
			const items = row.getValue("items") as string[];
			return <div className="text-xs sm:text-sm">{items.length} items</div>;
		},
		enableSorting: false,
		meta: {
			className: "hidden lg:table-cell",
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Created" />
		),
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date;
			return (
				<div className="text-xs sm:text-sm text-muted-foreground">
					{format(date, "MMM d, yyyy")}
				</div>
			);
		},
		meta: {
			className: "hidden md:table-cell",
		},
	},
	{
		id: "actions",
		header: () => <div className="text-right">Actions</div>,
		cell: ({ row }) => {
			const combo = row.original;

			return (
				<div className="flex items-center justify-end space-x-1">
					<Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
						<Link href={`/admin/postal-brownies/edit/${combo.id}`}>
							<Edit className="h-3 w-3 sm:h-4 sm:w-4" />
							<span className="sr-only">Edit</span>
						</Link>
					</Button>
					<DeletePostalComboButton id={combo.id} name={combo.name} />
				</div>
			);
		},
		enableSorting: false,
	},
];
