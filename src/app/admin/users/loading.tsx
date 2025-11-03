import { Shield, UserCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "@/components/users/columns";

export default function UsersLoading() {
	return (
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
						<Skeleton className="h-8 w-16 mb-2" />
						<Skeleton className="h-3 w-32" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Admins</CardTitle>
						<Shield className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-16 mb-2" />
						<Skeleton className="h-3 w-32" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Managers</CardTitle>
						<UserCheck className="h-4 w-4 text-yellow-500" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-16 mb-2" />
						<Skeleton className="h-3 w-32" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Customers</CardTitle>
						<Users className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-16 mb-2" />
						<Skeleton className="h-3 w-32" />
					</CardContent>
				</Card>
			</div>

			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
						columns={columns}
						data={[]}
						searchKey="displayName"
						searchPlaceholder="Search users..."
						isLoading={true}
					/>
				</div>
			</div>
		</div>
	);
}
