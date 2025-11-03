"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { useCakeOrderSettings } from "@/hooks/use-order-settings";
import { Alert, AlertDescription, AlertTitle } from "./alert";

function LoadingBanner() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (isLoading) return;
		setTimeout(() => {
			setIsLoading(false);
		}, 1000);
	}, [isLoading]);

	if (isLoading) {
		return null;
	}

	return (
		<Alert className="border-orange-200 bg-orange-50 text-orange-800 mb-6">
			<AlertTriangle className="h-4 w-4 text-orange-600" />
			<AlertTitle className="text-orange-900 font-semibold">
				Loading cake order settings...
			</AlertTitle>
		</Alert>
	);
}
export default function OrderRestrictionBanner() {
	const { settings, getNextOrderDay, isLoading } = useCakeOrderSettings();

	if (isLoading) {
		return <LoadingBanner />;
	}

	// Check if the system is completely disabled
	const isSystemDisabled = !settings?.isActive;

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
			<AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
			<AlertTitle className="text-orange-900 font-semibold text-sm sm:text-base">
				Cake Orders Currently Unavailable
			</AlertTitle>
			<AlertDescription className="text-orange-700 text-sm">
				<div className="space-y-2">
					{isSystemDisabled ? (
						<p>
							Our cake order system is currently disabled. Please check back
							later or contact us for more information about upcoming order
							periods.
						</p>
					) : (
						<>
							<p>
								We only accept cake orders on <strong>{allowedDaysText}</strong>{" "}
								each week.
							</p>
							<div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm">
								<Clock className="h-3 w-3 shrink-0 mt-0.5 sm:mt-0" />
								<span className="wrap-break-word">
									{getNextOrderDay === "now"
										? "Cake orders are being accepted today!"
										: `Cake orders will resume ${getNextOrderDay}`}
								</span>
							</div>
						</>
					)}
				</div>
			</AlertDescription>
		</Alert>
	);
}
