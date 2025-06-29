"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { useOrderSettings } from "@/hooks/use-order-settings";

export default function OrderRestrictionBanner() {
	const { settings, getNextOrderDay, isLoading } = useOrderSettings();

	if (isLoading) {
		return (
			<Alert className="border-orange-200 bg-orange-50 text-orange-800 mb-6">
				<AlertTriangle className="h-4 w-4 text-orange-600" />
				<AlertTitle className="text-orange-900 font-semibold">
					Loading...
				</AlertTitle>
			</Alert>
		);
	}

	const allowedDaysText = settings?.allowedDays
		? settings.allowedDays
				.map(
					(day) =>
						[
							"Sunday",
							"Monday",
							"Tuesday",
							"Wednesday",
							"Thursday",
							"Friday",
							"Saturday",
						][day],
				)
				.join(", ")
		: "Mondays and Tuesdays";

	return (
		<Alert className="border-orange-200 bg-orange-50 text-orange-800 mb-6">
			<AlertTriangle className="h-4 w-4 text-orange-600" />
			<AlertTitle className="text-orange-900 font-semibold">
				Orders Currently Unavailable
			</AlertTitle>
			<AlertDescription className="text-orange-700">
				<div className="space-y-2">
					<p>
						We only accept orders on <strong>{allowedDaysText}</strong> each
						week.
					</p>
					<div className="flex items-center gap-2 text-sm">
						<Clock className="h-3 w-3" />
						<span>
							{getNextOrderDay === "now"
								? "Orders are being accepted today!"
								: `Orders will resume ${getNextOrderDay}`}
						</span>
					</div>
				</div>
			</AlertDescription>
		</Alert>
	);
}
