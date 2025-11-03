import { format } from "date-fns";
import { Settings } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PostalOrderSettingsLoading() {
	return (
		<div className="container mx-auto py-8">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">
						Postal Order Settings
					</h1>
					<p className="text-muted-foreground">
						Configure order placement and dispatch periods for{" "}
						{format(new Date(), "MMMM yyyy")} postal brownies.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Settings className="h-5 w-5" />
								Loading...
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{Array.from({ length: 6 }).map((_, i) => (
								<div
									key={`form-skeleton-${
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
										i
									}`}
									className="h-12 bg-gray-200 rounded animate-pulse"
								/>
							))}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Current Settings</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={`list-skeleton-${
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
										i
									}`}
									className="h-16 bg-gray-200 rounded animate-pulse"
								/>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
