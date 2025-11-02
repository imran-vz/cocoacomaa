import { StaggerContainer } from "@/components/stagger-container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function OrderLoading() {
	return (
		<div className="container min-h-[calc(100svh-10rem)] mx-auto py-4 sm:py-6 lg:py-8 px-4">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
				<div className="lg:col-span-3">
					<div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-200 rounded animate-pulse mb-4 sm:mb-6 lg:mb-8" />
					<StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
						{Array.from({ length: 3 }, (_, i) => (
							<Card key={`loading-dessert-${i}-${Date.now()}`}>
								<CardHeader className="pb-3 sm:pb-4">
									<div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded animate-pulse" />
								</CardHeader>
								<CardContent className="pt-0">
									<div className="space-y-3 sm:space-y-4">
										<div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
										<div className="h-3 sm:h-4 w-16 sm:w-24 bg-gray-200 rounded animate-pulse" />
										<div className="h-8 sm:h-10 bg-gray-200 rounded animate-pulse" />
									</div>
								</CardContent>
							</Card>
						))}
					</StaggerContainer>
				</div>
			</div>
		</div>
	);
}
