import { Card, CardContent, CardHeader } from "@/components/ui/card";

const DAYS = [
	{ value: 0, label: "Sunday" },
	{ value: 1, label: "Monday" },
	{ value: 2, label: "Tuesday" },
	{ value: 3, label: "Wednesday" },
	{ value: 4, label: "Thursday" },
	{ value: 5, label: "Friday" },
	{ value: 6, label: "Saturday" },
];

export default function OrderDaysSettingsLoading() {
	return (
		<div className="container mx-auto py-6 px-4">
			<div className="max-w-6xl mx-auto">
				<div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6" />
				<Card>
					<CardHeader>
						<div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{DAYS.map((day) => (
								<div
									key={day.value}
									className="h-12 bg-gray-200 rounded animate-pulse"
								/>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
