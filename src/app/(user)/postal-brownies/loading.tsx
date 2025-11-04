import { Package } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PostalBrowniesLoading() {
	return (
		<div className="min-h-[calc(100svh-11rem)] bg-background">
			<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="text-center mb-6 sm:mb-8">
						<div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
							<Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-pulse" />
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
								Postal Brownies
							</h1>
						</div>
						<p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
							Indulge in our fudgy brownies delivered straight to your doorstep.
							Each combo is carefully crafted and securely packaged for the
							perfect gift or treat.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Package className="h-3 w-3 sm:h-4 sm:w-4" />
								<span>Only 1 brownie combo per order</span>
							</div>
							<div className="flex items-center gap-1">
								<Package className="h-3 w-3 sm:h-4 sm:w-4" />
								<span>Secure Packaging</span>
							</div>
						</div>
					</div>

					{/* Form label skeleton */}
					<div className="mb-4 sm:mb-6">
						<div className="h-6 sm:h-7 bg-muted rounded w-64 mx-auto animate-pulse" />
					</div>

					{/* Combo cards grid skeleton */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
						{Array.from({ length: 6 }).map((_, i) => (
							<Card
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
								key={i}
								className="overflow-hidden flex flex-col h-full pt-0"
							>
								{/* Image skeleton */}
								<div className="relative aspect-4/3 sm:aspect-video w-full bg-muted animate-pulse" />

								<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
									<div className="flex flex-col justify-between items-start gap-2">
										{/* Title skeleton */}
										<div className="h-5 sm:h-6 bg-muted rounded flex-1 w-full animate-pulse" />
										<div className="flex items-center justify-between w-full gap-2">
											{/* Egg badge skeleton */}
											<div className="h-5 w-24 bg-muted rounded animate-pulse" />
											{/* Price badge skeleton */}
											<div className="h-5 w-16 bg-muted rounded animate-pulse" />
										</div>
									</div>
								</CardHeader>

								<CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6 flex-1 flex flex-col">
									{/* Description skeleton */}
									<div className="space-y-2 mb-3 sm:mb-4">
										<div className="h-3 bg-muted rounded animate-pulse" />
										<div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
									</div>
									{/* Includes list skeleton */}
									<div className="space-y-2 mt-auto">
										<div className="h-3 w-16 bg-muted rounded animate-pulse" />
										<div className="space-y-1">
											{Array.from({ length: 3 }).map((_, j) => (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
													key={j}
													className="h-3 bg-muted rounded w-full animate-pulse"
												/>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Action buttons skeleton */}
					<div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
						<div className="flex-1" />
						<div className="h-10 w-full sm:w-24 bg-muted rounded-md animate-pulse" />
						<div className="h-10 w-full sm:w-32 bg-muted rounded-md animate-pulse" />
					</div>

					{/* Important notice banner skeleton */}
					<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
						<div className="flex items-start gap-3">
							<div className="shrink-0">
								<svg
									className="h-5 w-5 text-amber-600"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="flex-1">
								<h3 className="text-sm sm:text-base font-medium text-amber-800">
									Important Notice
								</h3>
								<p className="text-xs sm:text-sm text-amber-700 mt-1 leading-relaxed">
									Only one brownie combo per order. Adding a new combo will
									replace your current cart.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
