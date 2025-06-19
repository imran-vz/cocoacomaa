import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
	const desserts = Array.from({ length: 4 }).map((_, i) => i);

	return (
		<div className="container mx-auto py-8">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{desserts.map((i) => (
							<Card key={`loading-card-${i}`}>
								<CardHeader>
									<div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="h-48 bg-gray-200 rounded animate-pulse" />
										<div className="h-4 bg-gray-200 rounded animate-pulse" />
										<div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
										<div className="h-10 bg-gray-200 rounded animate-pulse" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
						</CardHeader>
						<CardContent>
							<div className="h-64 bg-gray-200 rounded animate-pulse" />
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
