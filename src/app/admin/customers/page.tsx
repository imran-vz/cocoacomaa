import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { Calendar, ShoppingCart, Users } from "lucide-react";
import { columns } from "@/components/customers/columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
	// Get all customers with their order statistics
	const customersList = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			phone: users.phone,
			role: users.role,
			createdAt: users.createdAt,
			orderCount: sql<number>`COALESCE(COUNT(${orders.id}), 0)`,
			totalSpent: sql<string>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
			lastOrderDate: sql<Date>`MAX(${orders.createdAt})`,
		})
		.from(users)
		.leftJoin(
			orders,
			and(
				eq(orders.userId, users.id),
				eq(orders.isDeleted, false),
				isNotNull(orders.razorpayPaymentId),
			),
		)
		.where(eq(users.role, "customer"))
		.groupBy(
			users.id,
			users.name,
			users.email,
			users.phone,
			users.role,
			users.createdAt,
		)
		.orderBy(desc(users.createdAt));

	// Calculate overview metrics
	const totalCustomers = customersList.length;
	const activeCustomers = customersList.filter(
		(customer) => customer.orderCount > 0,
	).length;
	const newCustomersThisMonth = customersList.filter((customer) => {
		const monthAgo = new Date();
		monthAgo.setMonth(monthAgo.getMonth() - 1);
		return customer.createdAt > monthAgo;
	}).length;

	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage and view all customer accounts
					</p>
				</div>
			</div>

			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-3 mb-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Customers
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalCustomers}</div>
						<p className="text-xs text-muted-foreground">
							All registered customers
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Customers
						</CardTitle>
						<ShoppingCart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{activeCustomers}
						</div>
						<p className="text-xs text-muted-foreground">
							Customers with orders
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							New This Month
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">
							{newCustomersThisMonth}
						</div>
						<p className="text-xs text-muted-foreground">New registrations</p>
					</CardContent>
				</Card>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
						columns={columns}
						data={customersList.map((customer) => ({
							...customer,
							totalSpent: Number(customer.totalSpent),
							displayName: customer.name || "No name provided",
						}))}
						searchKey="displayName"
						searchPlaceholder="Search customers..."
						filterableColumns={[
							{
								id: "orderCount",
								title: "Activity",
								options: [
									{ label: "Active (has orders)", value: "active" },
									{ label: "Inactive (no orders)", value: "inactive" },
								],
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
