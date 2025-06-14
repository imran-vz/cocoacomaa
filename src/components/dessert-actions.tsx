"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DessertActionsProps {
	id: number;
}

export function DessertActions({ id }: DessertActionsProps) {
	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this dessert?")) {
			await fetch(`/api/desserts/${id}`, {
				method: "DELETE",
			});
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
