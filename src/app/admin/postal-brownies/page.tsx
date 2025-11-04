import { Plus } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { postalComboColumns } from "./_components/postal-combo-columns";

export default async function AdminPostalBrowniesPage() {
	const postalCombos = await db.query.postalCombos.findMany({
		where: (postalCombos, { eq }) => eq(postalCombos.isDeleted, false),
		orderBy: (postalCombos, { desc }) => [desc(postalCombos.createdAt)],
		columns: {
			id: true,
			name: true,
			description: true,
			price: true,
			imageUrl: true,
			createdAt: true,
			items: true,
			status: true,
			containsEgg: true,
		},
	});

	return (
		<div className="container mx-auto py-3 sm:py-6 lg:py-8 px-3 sm:px-4">
			<div className="max-w-7xl mx-auto">
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
						<Button
							asChild
							size="lg"
							className="w-full sm:w-auto sm:self-start"
						>
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
							data={postalCombos}
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
		</div>
	);
}
