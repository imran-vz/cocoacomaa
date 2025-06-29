import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { postalComboColumns } from "./_components/postal-combo-columns";

export default async function AdminPostalBrowniesPage() {
	const postalCombos = await db.query.postalCombos.findMany({
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
			comboType: true,
		},
	});

	return (
		<div className="container mx-auto py-3 sm:py-6 lg:py-8 px-3 sm:px-4">
			<div className="max-w-7xl mx-auto">
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

				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
					<Card className="p-4 sm:p-6">
						<CardHeader className="pb-2 px-0 pt-0">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
								Total Combos
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0 px-0 pb-0">
							<div className="text-xl sm:text-2xl font-bold">
								{postalCombos.length}
							</div>
						</CardContent>
					</Card>
					<Card className="p-4 sm:p-6">
						<CardHeader className="pb-2 px-0 pt-0">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
								Available
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0 px-0 pb-0">
							<div className="text-xl sm:text-2xl font-bold">
								{postalCombos.filter((c) => c.status === "available").length}
							</div>
						</CardContent>
					</Card>
					<Card className="p-4 sm:p-6">
						<CardHeader className="pb-2 px-0 pt-0">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
								Unavailable
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0 px-0 pb-0">
							<div className="text-xl sm:text-2xl font-bold">
								{postalCombos.filter((c) => c.status === "unavailable").length}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* DataTable */}
				<Card>
					<CardHeader className="pb-4">
						<CardTitle className="text-lg sm:text-xl">
							All Postal Brownies
						</CardTitle>
					</CardHeader>
					<CardContent className="px-0 sm:px-6">
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
											{
												label: "Available",
												value: "available",
											},
											{
												label: "Unavailable",
												value: "unavailable",
											},
										],
									},
									{
										id: "comboType",
										title: "Type",
										options: [
											{
												label: "Classic",
												value: "classic",
											},
											{
												label: "Premium",
												value: "premium",
											},
											{
												label: "Deluxe",
												value: "deluxe",
											},
										],
									},
								]}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
