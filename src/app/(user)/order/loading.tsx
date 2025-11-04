import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function OrderLoading() {
	return (
		<div className="container min-h-[calc(100svh-11rem)] mx-auto py-4 sm:py-6 lg:py-8 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Title skeleton */}
				<div className="h-8 sm:h-9 bg-muted rounded w-48 mb-4 sm:mb-6 lg:mb-8 animate-pulse" />

				{/* Category filter skeleton */}
				<div className="flex gap-2 mb-4 sm:mb-6">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
							key={i}
							className="h-9 w-16 bg-muted rounded-md animate-pulse"
						/>
					))}
				</div>

				{/* Grid skeleton */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<Card
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
							key={i}
							className="overflow-hidden flex flex-col justify-between h-full pt-0"
						>
							{/* Image skeleton */}
							<div className="relative aspect-video w-full bg-muted animate-pulse" />

							<CardHeader className="pb-3 sm:pb-4 flex-1">
								{/* Title and price skeleton */}
								<div className="flex justify-between items-start gap-2 mb-2">
									<div className="h-6 sm:h-7 bg-muted rounded flex-1 animate-pulse" />
									<div className="h-6 w-16 bg-muted rounded animate-pulse shrink-0" />
								</div>

								{/* Badges skeleton */}
								<div className="flex flex-wrap gap-2 mt-2">
									<div className="h-5 w-12 bg-muted rounded animate-pulse" />
									<div className="h-5 w-24 bg-muted rounded animate-pulse" />
									<div className="h-5 w-20 bg-muted rounded animate-pulse" />
								</div>
							</CardHeader>

							<CardContent className="pt-0">
								<div className="space-y-3 sm:space-y-4">
									{/* Description skeleton */}
									<div className="space-y-2">
										<div className="h-3 bg-muted rounded animate-pulse" />
										<div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
									</div>

									{/* Button skeleton */}
									<div className="h-9 bg-muted rounded animate-pulse" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
