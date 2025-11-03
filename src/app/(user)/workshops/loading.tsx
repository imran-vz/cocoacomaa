import { FadeIn } from "@/components/fade-in";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function WorkshopsLoading() {
	return (
		<FadeIn>
			<div className="container mx-auto sm:px-6 min-h-[calc(100svh-11rem)] py-4 sm:py-6 lg:py-8 px-4">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-2xl sm:text-3xl font-bold mb-6">Workshops</h1>
					<p className="text-muted-foreground mb-6">
						Join our hands-on workshops to learn the art of dessert making from
						Maria and the team.
					</p>

					{/* Workshop Type Toggle Skeleton */}
					<div className="flex justify-center mb-6">
						<div className="h-12 w-64 bg-gray-200 rounded-full animate-pulse" />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="h-full overflow-hidden flex flex-col">
								<div className="aspect-video bg-gray-200 animate-pulse" />
								<CardHeader>
									<div className="flex justify-between items-start gap-2 mb-2">
										<div className="h-6 bg-gray-200 rounded animate-pulse flex-1" />
										<div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
									</div>
								</CardHeader>
								<CardContent className="flex-1 flex flex-col">
									<div className="space-y-2 mb-4 flex-1">
										<div className="h-4 bg-gray-200 rounded animate-pulse" />
										<div className="h-4 bg-gray-200 rounded animate-pulse" />
										<div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
									</div>
									<div className="mt-auto space-y-3">
										<div className="flex justify-between items-center">
											<div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
											<div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
										</div>
										<div className="h-10 bg-gray-200 rounded animate-pulse" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		</FadeIn>
	);
}
