import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { Shield, UserCheck, Users } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/users/columns";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
	const usersList = await db
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
		.groupBy(
			users.id,
			users.name,
			users.email,
			users.phone,
			users.role,
			users.createdAt,
		)
		.orderBy(desc(users.createdAt));

	const totalUsers = usersList.length;
	const adminCount = usersList.filter((user) => user.role === "admin").length;
	const managerCount = usersList.filter(
		(user) => user.role === "manager",
	).length;
	const customerCount = usersList.filter(
		(user) => user.role === "customer",
	).length;

	return (
		<FadeIn>
			<div className="container mx-auto p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold">Users Overview</h1>
						<p className="text-sm text-muted-foreground mt-1">
							View all user accounts and their activity
						</p>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-4 mb-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Users</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalUsers}</div>
							<p className="text-xs text-muted-foreground">All user accounts</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Admins</CardTitle>
							<Shield className="h-4 w-4 text-red-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600">
								{adminCount}
							</div>
							<p className="text-xs text-muted-foreground">Admin users</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Managers</CardTitle>
							<UserCheck className="h-4 w-4 text-yellow-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-yellow-600">
								{managerCount}
							</div>
							<p className="text-xs text-muted-foreground">Manager users</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Customers</CardTitle>
							<Users className="h-4 w-4 text-green-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{customerCount}
							</div>
							<p className="text-xs text-muted-foreground">Customer users</p>
						</CardContent>
					</Card>
				</div>

				<div className="rounded-md">
					<div className="overflow-x-auto">
						<DataTable
							columns={columns}
							data={usersList.map((user) => ({
								...user,
								totalSpent: Number(user.totalSpent),
								displayName: user.name || "No name provided",
							}))}
							searchKey="displayName"
							searchPlaceholder="Search users..."
							filterableColumns={[
								{
									id: "role",
									title: "Role",
									options: [
										{ label: "Admin", value: "admin" },
										{ label: "Manager", value: "manager" },
										{ label: "Customer", value: "customer" },
									],
								},
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
		</FadeIn>
	);
}
