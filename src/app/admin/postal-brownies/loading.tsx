import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { postalComboColumns } from "./_components/postal-combo-columns";

export default function PostalBrowniesLoading() {
	return (
		<AdminPageLayout
			title="Postal Brownies"
			subtitle="Manage and track all postal brownies"
			actions={
				<>
					<Button variant="outline" disabled={true}>
						<RefreshCw className={cn("h-4 w-4 animate-spin")} />
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
			data={[]}
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
			isLoading={true}
		/>
	);
}
