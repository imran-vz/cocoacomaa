"use client";

import { Plus } from "lucide-react";
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
	const { data: postalCombos } = usePostalBrownies(initialData);

	return (
		<div className="container mx-auto px-4 sm:px-6">
			<FadeIn>
				{/* Header */}
				<div className="flex flex-col gap-4 mb-6 sm:mb-8">
					<div className="text-center sm:text-left">
						<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
							Postal Brownies
						</h1>
						<p className="text-sm sm:text-base text-muted-foreground mt-1">
							Manage your postal brownie combinations
						</p>
					</div>
					<Button asChild size="lg" className="w-full sm:w-auto sm:self-start">
						<Link href="/admin/postal-brownies/new">
							<Plus className="h-4 w-4 mr-2" />
							Add New Combo
						</Link>
					</Button>
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
