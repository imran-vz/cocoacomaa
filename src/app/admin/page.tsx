import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { customers, desserts, orders, users } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { and, eq, gte, sql } from "drizzle-orm";
import {
	CheckCircle2,
	Clock,
	DollarSign,
	Package,
	TrendingUp,
	Users,
	XCircle,
} from "lucide-react";

export default async function AdminDashboard() {
	// Get total orders
	const totalOrders = await db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.then((res) => res[0].count);

	// Get total revenue
	const totalRevenue = await db
		.select({
			total: sql<number>`sum(${orders.total})`,
		})
		.from(orders)
		.where(eq(orders.status, "completed"))
		.then((res) => res[0].total || 0);

	// Get total desserts
	const totalDesserts = await db
		.select({ count: sql<number>`count(*)` })
		.from(desserts)
		.then((res) => res[0].count);

	// Get total customers
	const totalCustomers = await db
		.select({ count: sql<number>`count(*)` })
		.from(customers)
		.then((res) => res[0].count);

	// Get recent orders (last 7 days)
	const recentOrders = await db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(
			and(
				gte(orders.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
			),
		)
		.then((res) => res[0].count);

	// Get pending orders
	const pendingOrders = await db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(eq(orders.status, "pending"))
		.then((res) => res[0].count);

	// Get completed orders
	const completedOrders = await db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(eq(orders.status, "completed"))
		.then((res) => res[0].count);

	return (
		<div className="container mx-auto py-6">
			<h1 className="text-3xl font-bold mb-6">Dashboard</h1>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(totalRevenue)}
						</div>
						<p className="text-xs text-muted-foreground">All time revenue</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Orders</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalOrders}</div>
						<p className="text-xs text-muted-foreground">All time orders</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Desserts
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalDesserts}</div>
						<p className="text-xs text-muted-foreground">Available desserts</p>
					</CardContent>
				</Card>

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
							Registered customers
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{recentOrders}</div>
						<p className="text-xs text-muted-foreground">Last 7 days</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Orders
						</CardTitle>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{pendingOrders}</div>
						<p className="text-xs text-muted-foreground">
							Awaiting confirmation
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Completed Orders
						</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{completedOrders}</div>
						<p className="text-xs text-muted-foreground">
							Successfully delivered
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
