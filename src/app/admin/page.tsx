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
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { desserts, orders, users } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
	// Get total orders
	const totalOrdersPromise = db
		.select({ count: sql<number>`count(id)` })
		.from(orders)
		.then((res) => res[0].count);

	// Get total revenue
	const totalRevenuePromise = db
		.select({ total: sql<number>`sum(${orders.total})` })
		.from(orders)
		.where(eq(orders.status, "completed"))
		.then((res) => res[0].total || 0);

	// Get total desserts
	const totalDessertsPromise = db
		.select({ count: sql<number>`count(id)` })
		.from(desserts)
		.then((res) => res[0].count);

	// Get total customers
	const totalCustomersPromise = db
		.select({ count: sql<number>`count(id)` })
		.from(users)
		.where(eq(users.role, "customer"))
		.then((res) => res[0].count);

	// Get recent orders (last 7 days)
	const recentOrdersPromise = db
		.select({ count: sql<number>`count(id)` })
		.from(orders)
		.where(
			and(
				gte(orders.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
			),
		)
		.then((res) => res[0].count);

	// Get pending orders
	const pendingOrdersPromise = db
		.select({ count: sql<number>`count(id)` })
		.from(orders)
		.where(eq(orders.status, "pending"))
		.then((res) => res[0].count);

	// Get completed orders
	const completedOrdersPromise = db
		.select({ count: sql<number>`count(id)` })
		.from(orders)
		.where(eq(orders.status, "completed"))
		.then((res) => res[0].count);

	return (
		<div className="container mx-auto p-4 sm:p-6">
			<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Dashboard</h1>

			{/* Main Stats Grid */}
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				<Suspense fallback={<Loading />}>
					<TotalRevenue totalRevenuePromise={totalRevenuePromise} />
				</Suspense>

				<Suspense fallback={<Loading />}>
					<TotalOrders totalOrdersPromise={totalOrdersPromise} />
				</Suspense>

				<Suspense fallback={<Loading />}>
					<TotalDesserts totalDessertsPromise={totalDessertsPromise} />
				</Suspense>

				<Suspense fallback={<Loading />}>
					<TotalCustomers totalCustomersPromise={totalCustomersPromise} />
				</Suspense>
			</div>

			{/* Secondary Stats Grid */}
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
				<Suspense fallback={<Loading />}>
					<RecentOrders recentOrdersPromise={recentOrdersPromise} />
				</Suspense>

				<Suspense fallback={<Loading />}>
					<PendingOrders pendingOrdersPromise={pendingOrdersPromise} />
				</Suspense>

				<Suspense fallback={<Loading />}>
					<CompletedOrders completedOrdersPromise={completedOrdersPromise} />
				</Suspense>
			</div>

			{/* Quick Actions Section */}
			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					<Link href="/admin/orders">
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
					</Link>

					<Link href="/admin/desserts">
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
					</Link>

					<Link href="/admin/customers">
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
					</Link>
				</div>
			</div>
		</div>
	);
}

async function TotalRevenue({
	totalRevenuePromise,
}: {
	totalRevenuePromise: Promise<number>;
}) {
	const totalRevenue = await totalRevenuePromise.catch(() => 0);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
				<DollarSign className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-xl sm:text-2xl font-bold">
					{formatCurrency(totalRevenue)}
				</div>
				<p className="text-xs text-muted-foreground mt-1">All time revenue</p>
			</CardContent>
		</Card>
	);
}

async function TotalOrders({
	totalOrdersPromise,
}: {
	totalOrdersPromise: Promise<number>;
}) {
	const totalOrders = await totalOrdersPromise.catch(() => 0);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Total Orders</CardTitle>
				<Package className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-xl sm:text-2xl font-bold">{totalOrders}</div>
				<p className="text-xs text-muted-foreground mt-1">All time orders</p>
			</CardContent>
		</Card>
	);
}

async function TotalDesserts({
	totalDessertsPromise,
}: {
	totalDessertsPromise: Promise<number>;
}) {
	const totalDesserts = await totalDessertsPromise.catch(() => 0);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Total Desserts</CardTitle>
				<TrendingUp className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-xl sm:text-2xl font-bold">{totalDesserts}</div>
				<p className="text-xs text-muted-foreground mt-1">Available desserts</p>
			</CardContent>
		</Card>
	);
}

async function TotalCustomers({
	totalCustomersPromise,
}: {
	totalCustomersPromise: Promise<number>;
}) {
	const totalCustomers = await totalCustomersPromise.catch(() => 0);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Total Customers</CardTitle>
				<Users className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-xl sm:text-2xl font-bold">{totalCustomers}</div>
				<p className="text-xs text-muted-foreground mt-1">
					Registered customers
				</p>
			</CardContent>
		</Card>
	);
}

async function RecentOrders({
	recentOrdersPromise,
}: {
	recentOrdersPromise: Promise<number>;
}) {
	const recentOrders = await recentOrdersPromise.catch(() => 0);
	return (
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
	);
}

async function PendingOrders({
	pendingOrdersPromise,
}: {
	pendingOrdersPromise: Promise<number>;
}) {
	const pendingOrders = await pendingOrdersPromise.catch(() => 0);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
				<XCircle className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-xl sm:text-2xl font-bold">{pendingOrders}</div>
				<p className="text-xs text-muted-foreground mt-1">
					Awaiting confirmation
				</p>
			</CardContent>
		</Card>
	);
}

async function CompletedOrders({
	completedOrdersPromise,
}: {
	completedOrdersPromise: Promise<number>;
}) {
	const completedOrders = await completedOrdersPromise.catch(() => 0);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
				<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-xl sm:text-2xl font-bold">{completedOrders}</div>
				<p className="text-xs text-muted-foreground mt-1">
					Successfully delivered
				</p>
			</CardContent>
		</Card>
	);
}

function Loading() {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">
					<div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
				</CardTitle>
				<div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
			</CardHeader>

			<CardContent>
				<div className="text-xl sm:text-2xl font-bold">
					<div className="h-4 bg-gray-200 rounded animate-pulse" />
				</div>
				<div className="h-4 bg-gray-200 rounded animate-pulse" />
			</CardContent>
		</Card>
	);
}
