"use client";

import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { Button } from "@/components/ui/button";
import {
	type PostalComboItem,
	usePostalBrownies,
} from "@/hooks/use-postal-brownies";
import { cn } from "@/lib/utils";
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
		<AdminPageLayout
			title="Postal Brownies"
			subtitle="Manage and track all postal brownies"
			actions={
				<>
					<Button
						variant="outline"
						onClick={() => refetch()}
						disabled={isRefetching}
					>
						<RefreshCw
							className={cn("h-4 w-4", isRefetching ? "animate-spin" : "")}
						/>
						Refetch
					</Button>
					<Button asChild>
						<Link href="/admin/postal-brownies/new">
							<Plus className="h-4 w-4" />
							Add New Combo
						</Link>
					</Button>
				</>
			}
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
	);
}
