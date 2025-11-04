import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function WorkshopsLoading() {
	return (
		<div className="container mx-auto sm:px-6 min-h-[calc(100svh-11rem)] py-4 sm:py-6 lg:py-8 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-4 sm:mb-6">
					<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">
						Workshops
					</h1>
					<p className="text-muted-foreground mb-4 sm:mb-6">
						Join our hands-on workshops to learn the art of dessert making from
						Maria and the team.
					</p>
				</div>

				{/* Type filter skeleton */}
				<div className="flex gap-2 mb-4 sm:mb-6">
					<div className="h-9 w-20 bg-muted rounded-md animate-pulse" />
					<div className="h-9 w-20 bg-muted rounded-md animate-pulse" />
				</div>

				{/* Workshop cards grid skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<Card
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
							key={i}
							className="h-full flex flex-col overflow-hidden pt-0"
						>
							{/* Image skeleton */}
							<div className="relative aspect-video w-full bg-muted animate-pulse" />

							<CardHeader>
								<div className="flex justify-between items-start gap-2">
									{/* Title skeleton */}
									<div className="h-6 bg-muted rounded flex-1 animate-pulse" />
									{/* Badge skeleton */}
									<div className="h-5 w-16 bg-muted rounded animate-pulse shrink-0" />
								</div>
							</CardHeader>

							<CardContent className="flex-1 flex flex-col">
								{/* Description skeleton */}
								<div className="mb-4 flex-1 space-y-2">
									<div className="h-3 bg-muted rounded animate-pulse" />
									<div className="h-3 bg-muted rounded animate-pulse" />
									<div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
								</div>

								<div className="mt-auto space-y-4">
									{/* Price skeleton */}
									<div className="flex justify-between items-center">
										<div className="h-5 w-16 bg-muted rounded animate-pulse" />
										<div className="h-6 w-20 bg-muted rounded animate-pulse" />
									</div>

									{/* Button skeleton */}
									<div className="h-10 bg-muted rounded animate-pulse" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
