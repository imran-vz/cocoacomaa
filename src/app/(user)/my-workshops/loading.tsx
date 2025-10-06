import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MyWorkshopsLoading() {
	return (
		<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
			<h1 className="text-2xl sm:text-3xl font-bold mb-6">My Workshops</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3].map((i) => (
					<Card key={i} className="h-full">
						<CardHeader>
							<div className="h-6 bg-gray-200 rounded animate-pulse" />
							<div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="h-4 bg-gray-200 rounded animate-pulse" />
								<div className="h-4 bg-gray-200 rounded animate-pulse" />
								<div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
