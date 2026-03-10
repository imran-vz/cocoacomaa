import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyOrdersLoading() {
	return (
		<div className="container mx-auto py-8 px-4 min-h-[calc(100svh-11rem)]">
			<h1 className="text-2xl md:text-3xl font-bold mb-6">My Orders</h1>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<Card
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading elements
						key={i}
						className="flex flex-col h-full hover:shadow-md transition-shadow"
					>
						<CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
							<div className="flex flex-col gap-2 w-full">
								<Skeleton className="h-4 w-1/3" />
								<Skeleton className="h-3 w-1/2" />
							</div>
							<div className="flex flex-col items-end gap-2 w-full">
								<Skeleton className="h-5 w-16" />
								<Skeleton className="h-4 w-20" />
							</div>
						</CardHeader>

						<CardContent className="py-4 flex-1 flex flex-col justify-between">
							<div>
								<div className="flex items-start justify-between mb-4">
									<div className="w-full">
										<Skeleton className="h-3 w-10 mb-2" />
										<Skeleton className="h-6 w-24" />
									</div>
									<div className="text-right w-full flex flex-col items-end">
										<Skeleton className="h-3 w-10 mb-2" />
										<Skeleton className="h-4 w-16" />
									</div>
								</div>
							</div>

							<div className="mt-2 pt-4 border-t border-dashed">
								<div className="flex items-start gap-3">
									<Skeleton className="h-8 w-8 rounded-md shrink-0" />
									<div className="w-full">
										<Skeleton className="h-4 w-24 mb-2" />
										<Skeleton className="h-3 w-full max-w-[180px]" />
									</div>
								</div>
							</div>
						</CardContent>

						<CardFooter className="pt-0 pb-4 px-4 border-t bg-muted/10">
							<Skeleton className="h-10 w-full mt-4" />
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
