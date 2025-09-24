import { desc, eq } from "drizzle-orm";
import { Plus, UserCheck, Users } from "lucide-react";
import { columns } from "@/components/managers/columns";
import { CreateManagerDialog } from "@/components/managers/create-manager-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function ManagersPage() {
	const managersList = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			phone: users.phone,
			role: users.role,
			createdAt: users.createdAt,
		})
		.from(users)
		.where(eq(users.role, "manager"))
		.orderBy(desc(users.createdAt));

	const totalUsers = await db
		.select({ count: users.id })
		.from(users)
		.then((result) => result.length);

	const totalManagers = managersList.length;

	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">Manager Management</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Add, update, and manage manager accounts
					</p>
				</div>
				<CreateManagerDialog>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Manager
					</Button>
				</CreateManagerDialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2 mb-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalUsers}</div>
						<p className="text-xs text-muted-foreground">All system users</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Managers
						</CardTitle>
						<UserCheck className="h-4 w-4 text-yellow-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-600">
							{totalManagers}
						</div>
						<p className="text-xs text-muted-foreground">Manager accounts</p>
					</CardContent>
				</Card>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
						columns={columns}
						data={managersList.map((manager) => ({
							...manager,
							displayName: manager.name || "No name provided",
						}))}
						searchKey="displayName"
						searchPlaceholder="Search managers..."
					/>
				</div>
			</div>
		</div>
	);
}
