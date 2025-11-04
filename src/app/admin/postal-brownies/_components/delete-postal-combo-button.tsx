"use client";

import { Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeletePostalBrownie } from "@/hooks/use-postal-brownies";

interface DeletePostalComboButtonProps {
	id: number;
	name: string;
}

export default function DeletePostalComboButton({
	id,
	name,
}: DeletePostalComboButtonProps) {
	const { mutate: deletePostalBrownie, isPending } = useDeletePostalBrownie();

	const handleDelete = () => {
		deletePostalBrownie(id);
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
					disabled={isPending}
				>
					<Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
					<span className="sr-only">Delete</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="sm:max-w-[425px]">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-lg sm:text-xl">
						Delete Postal Combo
					</AlertDialogTitle>
					<AlertDialogDescription className="text-sm sm:text-base">
						Are you sure you want to delete "{name}"? This action cannot be
						undone and will remove the postal combo from all future orders.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
					<AlertDialogCancel disabled={isPending} className="mt-2 sm:mt-0">
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isPending}
						className="bg-red-600 hover:bg-red-700"
					>
						{isPending ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
