"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDeleteDessert } from "@/hooks/use-desserts";
import { confirm } from "./confirm-dialog";

interface DessertActionsProps {
	id: number;
}

export function DessertActions({ id }: DessertActionsProps) {
	const { mutate: deleteDessert, isPending } = useDeleteDessert();

	const handleDelete = async () => {
		const confirmed = await confirm({
			title: "Delete Dessert",
			description: "Are you sure you want to delete this dessert?",
		});
		if (confirmed) {
			deleteDessert(id);
		}
	};

	return (
		<div className="text-right">
			<Link href={`/admin/desserts/edit/${id}`}>
				<Button variant="ghost" size="sm" className="mr-2">
					Edit
				</Button>
			</Link>
			<Button
				variant="ghost"
				size="sm"
				className="text-red-600"
				onClick={handleDelete}
				disabled={isPending}
			>
				Delete
			</Button>
		</div>
	);
}
