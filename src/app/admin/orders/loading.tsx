import { FadeIn } from "@/components/fade-in";
import { columns } from "@/components/orders/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ORDER_STATUSES, ORDER_TYPES } from "@/lib/orders/constants";

export default function OrdersLoading() {
	return (
		<div className="container mx-auto p-4 sm:p-6">
			<FadeIn>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Manage and track all orders
						</p>
					</div>
					<Button disabled variant="outline" size="sm">
						Export Orders
					</Button>
				</div>
			</FadeIn>

			<FadeIn delay={0.1}>
				<div className="rounded-md">
					<div className="overflow-x-auto">
						<DataTable
							columns={columns}
							data={[]}
							searchKey="userName"
							searchPlaceholder="Filter orders..."
							filterableColumns={[
								{
									id: "status",
									title: "Status",
									options: ORDER_STATUSES,
								},
								{
									id: "orderType",
									title: "Order Type",
									options: ORDER_TYPES,
								},
							]}
							isLoading={true}
						/>
					</div>
				</div>
			</FadeIn>
		</div>
	);
}
