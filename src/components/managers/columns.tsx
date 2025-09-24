"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar, Mail, MoreHorizontal, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteManagerDialog } from "./delete-manager-dialog";
import { EditManagerDialog } from "./edit-manager-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

export const columns: ColumnDef<{
	id: string;
	name: string | null;
	email: string;
	phone: string | null;
	role: string;
	createdAt: Date;
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
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Created" />
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
		id: "actions",
		cell: ({ row }) => {
			const manager = row.original;

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
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(manager.email)}
						>
							Copy email
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<EditManagerDialog manager={manager}>
							<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
								Edit manager
							</DropdownMenuItem>
						</EditManagerDialog>
						<ResetPasswordDialog
							managerId={manager.id}
							managerName={manager.displayName}
							managerEmail={manager.email}
						>
							<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
								Reset password
							</DropdownMenuItem>
						</ResetPasswordDialog>
						<DeleteManagerDialog
							managerId={manager.id}
							managerName={manager.displayName}
						>
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className="text-red-600"
							>
								Delete manager
							</DropdownMenuItem>
						</DeleteManagerDialog>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
