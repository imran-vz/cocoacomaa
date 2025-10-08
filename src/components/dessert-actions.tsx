"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { confirm } from "./confirm-dialog";

interface DessertActionsProps {
	id: number;
}

export function DessertActions({ id }: DessertActionsProps) {
	const handleDelete = async () => {
		const confirmed = await confirm({
			title: "Delete Dessert",
			description: "Are you sure you want to delete this dessert?",
		});
		if (confirmed) {
			await fetch(`/api/desserts/${id}`, { method: "DELETE" });
			window.location.reload();
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
			>
				Delete
			</Button>
		</div>
	);
}
