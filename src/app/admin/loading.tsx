import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
	return (
		<div className="container mx-auto p-4 sm:p-6">
			<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Dashboard</h1>

			{/* Main Stats Grid */}
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				<CardSkeleton />
				<CardSkeleton />
				<CardSkeleton />
				<CardSkeleton />
			</div>

			{/* Secondary Stats Grid */}
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
				<CardSkeleton />
				<CardSkeleton />
				<CardSkeleton />
			</div>

			{/* Quick Actions Section */}
			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
					<CardSkeleton />
					<CardSkeleton />
					<CardSkeleton />
					<CardSkeleton />
				</div>
			</div>
		</div>
	);
}

function CardSkeleton() {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">
					<div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
				</CardTitle>
				<div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
			</CardHeader>

			<CardContent>
				<div className="text-xl sm:text-2xl font-bold mb-1">
					<div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
				</div>
				<div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
			</CardContent>
		</Card>
	);
}
