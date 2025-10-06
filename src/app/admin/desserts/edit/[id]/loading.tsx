import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditDessertLoading() {
	return (
		<div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle>Edit Dessert</CardTitle>
					<CardDescription>Update the details of your dessert</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-8">
						{/* Name and Price fields */}
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Skeleton className="h-4 w-12" />
								<Skeleton className="h-10 w-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-10 w-full" />
							</div>
						</div>

						{/* Description field */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-24 w-full" />
						</div>

						{/* Image upload field */}
						<div className="space-y-4">
							<Skeleton className="h-4 w-24" />
							<div className="flex flex-col space-y-4">
								<Skeleton className="h-48 w-full max-w-sm" />
								<div className="flex flex-col space-y-2">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-4 w-64" />
								</div>
							</div>
						</div>

						{/* Category and Lead Time */}
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-10 w-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-10 w-full" />
							</div>
						</div>

						{/* Egg Content toggle */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-20 w-full rounded-md" />
						</div>

						{/* Status field */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-10 w-full" />
						</div>

						{/* Buttons */}
						<div className="flex justify-end gap-4">
							<Skeleton className="h-10 w-20" />
							<Skeleton className="h-10 w-32" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
