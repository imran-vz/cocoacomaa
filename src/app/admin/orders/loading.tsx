import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { columns } from "@/components/orders/columns";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES, ORDER_TYPES } from "@/lib/orders/constants";

export default function OrdersLoading() {
	return (
		<AdminPageLayout
			title="Orders"
			subtitle="Manage and track all orders"
			actions={
				<Button disabled variant="outline" size="sm">
					Export Orders
				</Button>
			}
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
	);
}
