"use client";

import { Package } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PostalBrowniesLoading() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="text-center mb-6 sm:mb-8">
						<div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
							<Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
								Postal Brownies
							</h1>
						</div>
						<p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
							Indulge in our secure brownies delivered straight to your
							doorstep. Each combo is carefully crafted and beautifully packaged
							for the perfect gift or treat.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Package className="h-3 w-3 sm:h-4 sm:w-4" />
								<span>Only one brownie combo per order</span>
							</div>
							<div className="flex items-center gap-1">
								<Package className="h-3 w-3 sm:h-4 sm:w-4" />
								<span>Secure Packaging</span>
							</div>
						</div>
					</div>

					{/* Form */}
					<form className="space-y-6 sm:space-y-8">
						<div className="space-y-4 sm:space-y-6">
							<div className="text-lg sm:text-xl font-semibold block text-center">
								Choose Your Brownie Combo
							</div>
							<div>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
									{Array.from(
										{ length: 6 },
										(_, i) => `skeleton-${Date.now()}-${i}`,
									).map((skeletonId) => (
										<Card key={skeletonId} className="h-full">
											<div className="aspect-video bg-gray-200 animate-pulse rounded-t-lg" />
											<CardHeader className="pb-2">
												<div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
												<div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
											</CardHeader>
											<CardContent className="pt-0">
												<div className="space-y-2">
													<div className="h-3 bg-gray-200 rounded animate-pulse" />
													<div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
