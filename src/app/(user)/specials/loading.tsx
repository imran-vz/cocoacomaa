import { CalendarDays, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function SpecialsLoading() {
	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-4">Specials</h1>

					{/* Description skeleton */}
					<div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
						<Skeleton className="h-5 w-full max-w-2xl mx-auto" />
					</div>

					{/* Pickup Information Card skeleton */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CalendarDays className="h-5 w-5" />
								Pickup Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<CalendarDays className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Pickup Dates:</span>
									<Skeleton className="h-5 w-48" />
								</div>
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Pickup Time:</span>
									<Skeleton className="h-5 w-32" />
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Filter section skeleton */}
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-muted-foreground">
								Filter by:
							</span>
							<ToggleGroup
								type="single"
								disabled
								className="justify-start opacity-50"
							>
								<ToggleGroupItem value="all" aria-label="Show all specials">
									<span className="text-xs whitespace-nowrap text-nowrap">
										All Specials
									</span>
								</ToggleGroupItem>
								<ToggleGroupItem
									value="eggless"
									aria-label="Show eggless specials only"
								>
									<span className="text-xs whitespace-nowrap text-nowrap">
										Eggless
									</span>
								</ToggleGroupItem>
								<ToggleGroupItem
									value="contains-egg"
									aria-label="Show specials containing egg"
								>
									<span className="text-xs whitespace-nowrap text-nowrap">
										Contains Egg
									</span>
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
						<Skeleton className="h-4 w-32" />
					</div>
				</div>

				{/* Grid of special card skeletons */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
						<Card key={i} className="overflow-hidden">
							{/* Image skeleton */}
							<Skeleton className="h-48 w-full rounded-none" />

							<CardHeader>
								<div className="flex items-start justify-between gap-3 flex-col">
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-5 w-24" />
								</div>
							</CardHeader>

							<CardContent className="gap-y-4 flex flex-col flex-1">
								{/* Description skeleton */}
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-5/6" />
								</div>

								{/* Price skeleton */}
								<div className="flex justify-between items-center">
									<Skeleton className="h-8 w-24" />
								</div>

								{/* Button skeleton */}
								<Skeleton className="h-10 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
