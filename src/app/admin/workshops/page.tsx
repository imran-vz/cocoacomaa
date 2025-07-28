import { desc, eq, sql } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/workshops/columns";
import { db } from "@/lib/db";
import { workshopOrders, workshops } from "@/lib/db/schema";

export default async function AdminWorkshopsPage() {
	// Single query to get workshops with slot data
	const workshopsWithSlotData = await db
		.select({
			id: workshops.id,
			title: workshops.title,
			description: workshops.description,
			imageUrl: workshops.imageUrl,
			amount: workshops.amount,
			type: workshops.type,
			maxBookings: workshops.maxBookings,
			status: workshops.status,
			createdAt: workshops.createdAt,
			currentSlotsUsed: sql<number>`coalesce(sum(case when ${workshopOrders.isDeleted} = false and ${workshopOrders.razorpayPaymentId} is not null then ${workshopOrders.slots} else 0 end), 0)`,
			currentBookings: sql<number>`coalesce(count(case when ${workshopOrders.isDeleted} = false and ${workshopOrders.razorpayPaymentId} is not null then 1 else null end), 0)`,
		})
		.from(workshops)
		.leftJoin(workshopOrders, eq(workshops.id, workshopOrders.workshopId))
		.where(eq(workshops.isDeleted, false))
		.groupBy(
			workshops.id,
			workshops.title,
			workshops.description,
			workshops.imageUrl,
			workshops.amount,
			workshops.type,
			workshops.maxBookings,
			workshops.status,
			workshops.createdAt,
		)
		.orderBy(desc(workshops.createdAt))
		.then((results) =>
			results.map((row) => ({
				...row,
				currentSlotsUsed: Number(row.currentSlotsUsed),
				currentBookings: Number(row.currentBookings),
				availableSlots: Math.max(
					0,
					row.maxBookings - Number(row.currentSlotsUsed),
				),
				workshopOrders: [], // Keep for compatibility
			})),
		);

	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">Workshops</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage workshop offerings and registrations
					</p>
				</div>
				<Button asChild>
					<Link href="/admin/workshops/new">
						<Plus className="mr-2 h-4 w-4" />
						Add Workshop
					</Link>
				</Button>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
						columns={columns}
						data={workshopsWithSlotData}
						searchKey="title"
						searchPlaceholder="Filter workshops..."
						filterableColumns={[
							{
								id: "type",
								title: "Type",
								options: [
									{ label: "Online", value: "online" },
									{ label: "Offline", value: "offline" },
								],
							},
							{
								id: "status",
								title: "Status",
								options: [
									{ label: "Active", value: "active" },
									{ label: "Inactive", value: "inactive" },
								],
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
