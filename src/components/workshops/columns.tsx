"use client";

import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Workshop } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { confirm } from "../confirm-dialog";

const handleDelete = async (id: number, title: string) => {
	const confirmed = await confirm({
		title: "Delete Workshop",
		description: `Are you sure you want to delete the workshop "${title}"?`,
	});
	if (!confirmed) return;

	try {
		await axios.delete(`/api/workshops/${id}`);
		toast.success("Workshop deleted successfully");
		window.location.reload();
	} catch (error) {
		console.error("Error deleting workshop:", error);
		toast.error("Failed to delete workshop");
	}
};

type WorkshopWithSlotData = Omit<
	Workshop,
	"createdAt" | "updatedAt" | "isDeleted"
> & {
	currentSlotsUsed: number;
	currentBookings: number;
	availableSlots: number;
	workshopOrders: { userId: string }[];
};

export const columns: ColumnDef<WorkshopWithSlotData>[] = [
	{
		accessorKey: "title",
		header: "Title",
	},
	{
		accessorKey: "imageUrl",
		header: "Image",
		cell: ({ row }) => {
			const imageUrl = row.getValue("imageUrl") as string | null;
			return imageUrl ? (
				<div className="relative w-16 h-12 rounded overflow-hidden">
					<Image
						src={imageUrl}
						alt={row.original.title}
						fill
						className="object-cover"
						sizes="64px"
					/>
				</div>
			) : (
				<div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
					No image
				</div>
			);
		},
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			return (
				<Badge variant={type === "online" ? "default" : "secondary"}>
					{type}
				</Badge>
			);
		},
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) => {
			const amount = row.getValue("amount") as string;
			return formatCurrency(Number(amount));
		},
	},
	{
		accessorKey: "maxBookings",
		header: "Slots",
		cell: ({ row }) => {
			const maxBookings = row.getValue("maxBookings") as number;
			const currentSlotsUsed = row.original.currentSlotsUsed ?? 0;
			const currentBookings = row.original.currentBookings ?? 0;
			const availableSlots =
				row.original.availableSlots ?? maxBookings - currentSlotsUsed;

			return (
				<div className="text-sm">
					<div className="font-medium">
						{currentSlotsUsed} / {maxBookings} slots
					</div>
					<div className="text-xs text-muted-foreground">
						{currentBookings} order{currentBookings !== 1 ? "s" : ""}
					</div>
					<div
						className={`text-xs ${availableSlots === 0 ? "text-red-500" : availableSlots <= 3 ? "text-orange-500" : "text-green-600"}`}
					>
						{availableSlots} available
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
				<Badge variant={status === "active" ? "default" : "secondary"}>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date;
			return format(date, "MMM d, yyyy");
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const workshop = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href={`/admin/workshops/edit/${workshop.id}`}>
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDelete(workshop.id, workshop.title)}
							className="text-red-600"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
