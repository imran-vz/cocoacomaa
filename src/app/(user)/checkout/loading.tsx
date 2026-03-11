import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
	return (
		<div className="container mx-auto py-3 sm:py-6 lg:py-8 px-3 sm:px-4">
			{/* Title */}
			<Skeleton className="h-7 sm:h-8 lg:h-9 w-32 mb-3 sm:mb-6 lg:mb-8" />

			{/* Mobile Wizard Progress */}
			<div className="lg:hidden flex items-center justify-between px-1 mb-4">
				<div className="flex flex-col items-center gap-1">
					<Skeleton className="w-6 h-6 rounded-full" />
					<Skeleton className="h-2 w-8" />
				</div>
				<Skeleton className="h-0.5 flex-1 mx-2" />
				<div className="flex flex-col items-center gap-1">
					<Skeleton className="w-6 h-6 rounded-full" />
					<Skeleton className="h-2 w-8" />
				</div>
				<Skeleton className="h-0.5 flex-1 mx-2" />
				<div className="flex flex-col items-center gap-1">
					<Skeleton className="w-6 h-6 rounded-full" />
					<Skeleton className="h-2 w-8" />
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8">
				{/* Main Form (Left/Center) */}
				<Card className="order-2 lg:order-1 lg:col-span-7 xl:col-span-8">
					<CardContent className="pt-4 sm:pt-6 space-y-4 sm:space-y-5">
						{/* Desktop Step 1 Header */}
						<div className="hidden lg:flex items-center gap-2 mb-4 pb-2 border-b">
							<Skeleton className="w-6 h-6 rounded-full" />
							<Skeleton className="h-5 w-44" />
						</div>

						{/* Contact Card Skeleton */}
						<div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
							<Skeleton className="h-3 w-12 mb-2" />
							<div className="space-y-1.5">
								<Skeleton className="h-4 w-36" />
								<Skeleton className="h-4 w-48" />
							</div>
						</div>

						{/* Phone Card Skeleton */}
						<div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
							<div className="flex items-center justify-between">
								<div>
									<Skeleton className="h-3 w-10 mb-1.5" />
									<Skeleton className="h-4 w-28" />
								</div>
								<Skeleton className="h-7 w-14 rounded-md" />
							</div>
						</div>

						{/* Notes Field Skeleton */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-10 sm:h-11 w-full rounded-md" />
							<Skeleton className="h-3 w-40" />
						</div>

						{/* Mobile Continue Button */}
						<div className="lg:hidden mt-6 pt-4 border-t">
							<Skeleton className="h-10 w-full rounded-md" />
						</div>

						{/* Desktop Step 2 Header */}
						<div className="hidden lg:flex items-center gap-2 mb-4 mt-8 pb-2 border-b">
							<Skeleton className="w-6 h-6 rounded-full" />
							<Skeleton className="h-5 w-32" />
						</div>

						{/* Pickup Schedule Skeleton (Desktop) */}
						<div className="hidden lg:block space-y-4">
							<div className="border-t pt-4">
								<div className="flex items-center gap-2 mb-3">
									<Skeleton className="h-5 w-5 rounded" />
									<Skeleton className="h-5 w-32" />
								</div>
								<Skeleton className="h-4 w-full max-w-md mb-4" />
							</div>

							{/* Date Picker Skeleton */}
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-10 sm:h-11 w-full rounded-md" />
							</div>

							{/* Time Picker Skeleton */}
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-10 sm:h-11 w-full rounded-md" />
							</div>
						</div>

						{/* Desktop Pay Button */}
						<div className="hidden lg:block mt-8 pt-6 border-t">
							<Skeleton className="h-11 w-full rounded-md" />
						</div>
					</CardContent>
				</Card>

				{/* Order Summary (Right/Sidebar) - Desktop only during loading */}
				<div className="order-1 lg:order-2 lg:col-span-5 xl:col-span-4 hidden lg:block">
					<Card>
						<CardHeader className="pb-4 sm:pb-6">
							<Skeleton className="h-6 w-32" />
							{/* Lead time banner skeleton */}
							<div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border mt-2">
								<Skeleton className="h-4 w-4 rounded" />
								<Skeleton className="h-4 w-48" />
							</div>
						</CardHeader>
						<CardContent className="pt-0 space-y-3 sm:space-y-4">
							{/* Cart Items */}
							{Array.from({ length: 2 }).map((_, i) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
									key={i}
									className="flex justify-between items-start gap-2"
								>
									<div className="flex-1 min-w-0 space-y-1.5">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-20" />
										<Skeleton className="h-3 w-24" />
									</div>
									<Skeleton className="h-4 w-14 shrink-0" />
								</div>
							))}

							{/* Pricing Breakdown */}
							<div className="border-t pt-3 sm:pt-4 space-y-2">
								<div className="flex justify-between items-center">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-16" />
								</div>
								<div className="flex justify-between items-center font-medium border-t pt-2">
									<Skeleton className="h-5 w-12" />
									<Skeleton className="h-5 w-20" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
