"use client";

import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	type PostalComboItem,
	usePostalBrownies,
} from "@/hooks/use-postal-brownies";
import { postalComboColumns } from "./postal-combo-columns";

type PostalBrowniesClientProps = {
	initialData: PostalComboItem[];
};

export function PostalBrowniesClient({
	initialData,
}: PostalBrowniesClientProps) {
	const {
		data: postalCombos,
		refetch,
		isRefetching,
	} = usePostalBrownies(initialData);

	return (
		<div className="container mx-auto px-4 sm:px-6">
			<FadeIn>
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<h1 className="text-3xl font-bold">Postal Brownies</h1>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => refetch()}
							disabled={isRefetching}
						>
							<RefreshCw
								className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
							/>
							Refetch
						</Button>
						<Button asChild>
							<Link href="/admin/postal-brownies/new">
								<Plus className="mr-2 h-4 w-4" />
								Add New Combo
							</Link>
						</Button>
					</div>
				</div>
			</FadeIn>

			{/* DataTable */}
			<FadeIn delay={0.1}>
				<div className="px-4 sm:px-0">
					<DataTable
						columns={postalComboColumns}
						data={postalCombos || []}
						searchKey="name"
						searchPlaceholder="Search postal brownies..."
						filterableColumns={[
							{
								id: "status",
								title: "Status",
								options: [
									{ label: "Available", value: "available" },
									{ label: "Unavailable", value: "unavailable" },
								],
							},
							{
								id: "containsEgg",
								title: "Egg Content",
								options: [
									{ label: "Contains Egg", value: "true" },
									{ label: "Eggless", value: "false" },
								],
							},
						]}
					/>
				</div>
			</FadeIn>
		</div>
	);
}
