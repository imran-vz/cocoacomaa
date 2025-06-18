import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package } from "lucide-react";

export default function OrderDetailsLoading() {
	return (
		<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<Button variant="outline" size="icon" className="shrink-0" disabled>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="min-w-0 flex-1">
						<Skeleton className="h-8 w-48 mb-2" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Order Status & Info */}
					<div className="lg:col-span-2 space-y-6">
						{/* Status Card */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Package className="h-5 w-5" />
									Order Status
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<Skeleton className="h-6 w-24" />
										<Skeleton className="h-6 w-32" />
									</div>
									<div className="flex items-center justify-between">
										<Skeleton className="h-6 w-24" />
										<Skeleton className="h-6 w-32" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Order Items */}
						<Card>
							<CardHeader>
								<CardTitle>Order Items</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{[1, 2, 3].map((i) => (
										<div key={i} className="flex items-center justify-between">
											<div className="space-y-2">
												<Skeleton className="h-5 w-48" />
												<Skeleton className="h-4 w-32" />
											</div>
											<Skeleton className="h-6 w-24" />
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Customer Info */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Customer Information</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="space-y-2">
										<Skeleton className="h-5 w-32" />
										<Skeleton className="h-4 w-48" />
									</div>
									<div className="space-y-2">
										<Skeleton className="h-5 w-32" />
										<Skeleton className="h-4 w-48" />
									</div>
									<div className="space-y-2">
										<Skeleton className="h-5 w-32" />
										<Skeleton className="h-4 w-48" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Pickup Details</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="space-y-2">
										<Skeleton className="h-5 w-32" />
										<Skeleton className="h-4 w-48" />
									</div>
									<div className="space-y-2">
										<Skeleton className="h-5 w-32" />
										<Skeleton className="h-4 w-48" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
