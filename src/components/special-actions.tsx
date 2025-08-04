"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SpecialActionsProps {
	id: number;
}

export function SpecialActions({ id }: SpecialActionsProps) {
	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this special?")) {
			await fetch(`/api/desserts/${id}`, {
				method: "DELETE",
			});
			window.location.reload();
		}
	};

	return (
		<div className="text-right">
			<Link href={`/admin/specials/edit/${id}`}>
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
