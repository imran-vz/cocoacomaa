import { sub } from "date-fns";
import { and, eq, gte, isNotNull, not, sql } from "drizzle-orm";
import {
	CheckCircle2,
	Clock,
	DollarSign,
	Package,
	Shield,
	TrendingUp,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { FadeIn } from "@/components/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/db";
import { desserts, orders, users } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
	// Base filter for valid orders (not deleted and have payment ID)
	const validOrdersFilter = and(
		eq(orders.isDeleted, false),
		isNotNull(orders.razorpayPaymentId),
	);

	// Get total orders (valid orders only)
	const totalOrdersPromise = db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(validOrdersFilter)
		.then((res) => res[0].count);

	// Get total revenue (paid orders only)
	const totalRevenuePromise = db
		.select({ total: sql<number>`sum(CAST(${orders.total} AS DECIMAL))` })
		.from(orders)
		.where(validOrdersFilter)
		.then((res) => Number(res[0].total) || 0);

	// Get total desserts (available and not deleted)
	const totalDessertsPromise = db
		.select({ count: sql<number>`count(*)` })
		.from(desserts)
		.where(and(eq(desserts.status, "available"), eq(desserts.isDeleted, false)))
		.then((res) => res[0].count);

	// Get total customers (unchanged)
	const totalCustomersPromise = db
		.select({ count: sql<number>`count(*)` })
		.from(users)
		.where(eq(users.role, "customer"))
		.then((res) => res[0].count);

	// Get recent orders (last 7 days, valid orders only)
	const recentOrdersPromise = db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(
			and(
				validOrdersFilter,
				gte(orders.createdAt, sub(new Date(), { days: 7 })),
			),
		)
		.then((res) => res[0].count);

	// Get pending orders (valid orders only)
	const pendingOrdersPromise = db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(and(validOrdersFilter, not(eq(orders.status, "completed"))))
		.then((res) => res[0].count);

	// Get completed orders (valid orders only)
	const completedOrdersPromise = db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(and(validOrdersFilter, eq(orders.status, "completed")))
		.then((res) => res[0].count);

	return (
		<FadeIn>
			<div className="container mx-auto p-4 sm:p-6">
				<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
					Dashboard
				</h1>

				{/* Main Stats Grid */}
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
					<Suspense
						fallback={
							<StatCardLoading
								icon={DollarSign}
								title="Total Revenue"
								subtitle="From paid orders"
							/>
						}
					>
						<StatCard
							title="Total Revenue"
							icon={DollarSign}
							valuePromise={totalRevenuePromise}
							subtitle="From paid orders"
						/>
					</Suspense>

					<Suspense
						fallback={
							<StatCardLoading
								icon={Package}
								title="Total Orders"
								subtitle="Valid orders with payment"
							/>
						}
					>
						<StatCard
							title="Total Orders"
							icon={Package}
							valuePromise={totalOrdersPromise}
							subtitle="Valid orders with payment"
						/>
					</Suspense>

					<Suspense
						fallback={
							<StatCardLoading
								icon={TrendingUp}
								title="Total Desserts"
								subtitle="Available desserts"
							/>
						}
					>
						<StatCard
							title="Total Desserts"
							icon={TrendingUp}
							valuePromise={totalDessertsPromise}
							subtitle="Available desserts"
						/>
					</Suspense>

					<Suspense
						fallback={
							<StatCardLoading
								icon={Users}
								title="Total Customers"
								subtitle="Registered customers"
							/>
						}
					>
						<StatCard
							title="Total Customers"
							icon={Users}
							valuePromise={totalCustomersPromise}
							subtitle="Registered customers"
						/>
					</Suspense>
				</div>

				{/* Secondary Stats Grid */}
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
					<Suspense
						fallback={
							<StatCardLoading
								icon={Clock}
								title="Recent Orders"
								subtitle="Last 7 days"
							/>
						}
					>
						<StatCard
							title="Recent Orders"
							icon={Clock}
							valuePromise={recentOrdersPromise}
							subtitle="Last 7 days"
						/>
					</Suspense>

					<Suspense
						fallback={
							<StatCardLoading
								icon={XCircle}
								title="Pending Orders"
								subtitle="Awaiting confirmation"
							/>
						}
					>
						<StatCard
							title="Pending Orders"
							icon={XCircle}
							valuePromise={pendingOrdersPromise}
							subtitle="Awaiting confirmation"
						/>
					</Suspense>

					<Suspense
						fallback={
							<StatCardLoading
								icon={CheckCircle2}
								title="Completed Orders"
								subtitle="Successfully delivered"
							/>
						}
					>
						<StatCard
							title="Completed Orders"
							icon={CheckCircle2}
							valuePromise={completedOrdersPromise}
							subtitle="Successfully delivered"
						/>
					</Suspense>
				</div>

				{/* Quick Actions Section */}
				<div className="mt-8">
					<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
												Manage customers
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</Link>

						<Link href="/admin/managers">
							<Card className="hover:shadow-md transition-shadow cursor-pointer">
								<CardContent className="p-4">
									<div className="flex items-center space-x-4">
										<Shield className="h-6 w-6 text-primary" />
										<div>
											<h3 className="font-medium">Manage Managers</h3>
											<p className="text-sm text-muted-foreground">
												Add, edit and delete managers
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</Link>
					</div>
				</div>
			</div>
		</FadeIn>
	);
}

async function StatCard({
	title,
	icon: Icon,
	valuePromise,
	subtitle,
}: {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	valuePromise: Promise<number>;
	subtitle: string;
}) {
	const value = await valuePromise.catch(() => 0);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-xl sm:text-2xl font-bold">
					{formatCurrency(value)}
				</div>
				<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
			</CardContent>
		</Card>
	);
}

function StatCardLoading({
	icon: Icon,
	title,
	subtitle,
}: {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	subtitle: string;
}) {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-xl sm:text-2xl font-bold">
					<Skeleton className="h-8 w-32" />
				</div>
				<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
			</CardContent>
		</Card>
	);
}
