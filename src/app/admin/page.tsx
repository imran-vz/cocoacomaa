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
		<div className="container mx-auto p-4 sm:p-6">
			<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Dashboard</h1>

			{/* Main Stats Grid */}
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">
							{formatCurrency(totalRevenue)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							All time revenue
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Orders</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">{totalOrders}</div>
						<p className="text-xs text-muted-foreground mt-1">
							All time orders
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Desserts
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">{totalDesserts}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Available desserts
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Customers
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">
							{totalCustomers}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Registered customers
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Secondary Stats Grid */}
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">{recentOrders}</div>
						<p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Orders
						</CardTitle>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">{pendingOrders}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Awaiting confirmation
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Completed Orders
						</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">
							{completedOrders}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Successfully delivered
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions Section */}
			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					<Card className="hover:shadow-md transition-shadow cursor-pointer">
						<CardContent className="p-4">
							<div className="flex items-center space-x-4">
								<Package className="h-6 w-6 text-primary" />
								<div>
									<h3 className="font-medium">View Orders</h3>
									<p className="text-sm text-muted-foreground">
										Manage all orders
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow cursor-pointer">
						<CardContent className="p-4">
							<div className="flex items-center space-x-4">
								<TrendingUp className="h-6 w-6 text-primary" />
								<div>
									<h3 className="font-medium">Manage Desserts</h3>
									<p className="text-sm text-muted-foreground">
										Add or edit desserts
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow cursor-pointer">
						<CardContent className="p-4">
							<div className="flex items-center space-x-4">
								<Users className="h-6 w-6 text-primary" />
								<div>
									<h3 className="font-medium">View Customers</h3>
									<p className="text-sm text-muted-foreground">
										Manage customer accounts
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
