"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

interface DeletePostalComboButtonProps {
	id: number;
	name: string;
}

export default function DeletePostalComboButton({
	id,
	name,
}: DeletePostalComboButtonProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		try {
			setIsDeleting(true);

			const response = await fetch(`/api/postal-combos/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete postal combo");
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || "Failed to delete postal combo");
			}

			toast.success("Postal combo deleted successfully");
			router.refresh(); // Refresh the page to update the list
		} catch (error) {
			console.error("Error deleting postal combo:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to delete postal combo",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
					<AlertDialogCancel disabled={isDeleting} className="mt-2 sm:mt-0">
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isDeleting}
						className="bg-red-600 hover:bg-red-700"
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
