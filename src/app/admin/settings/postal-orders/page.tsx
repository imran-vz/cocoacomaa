import { format } from "date-fns";

import { FadeIn } from "@/components/fade-in";
import { db } from "@/lib/db";
import { PostalOrderSettingsClient } from "./_components/postal-order-settings-client";

export default async function PostalOrderSettingsPage() {
	// Get current month in YYYY-MM format (UTC)
	const currentMonth = format(new Date(), "yyyy-MM");

	// Fetch initial settings on server
	const settingsData = await db.query.postalOrderSettings.findMany({
		where: (postalOrderSettings, { eq }) =>
			eq(postalOrderSettings.month, currentMonth),
		orderBy: (postalOrderSettings, { asc }) => [
			asc(postalOrderSettings.orderStartDate),
		],
		columns: {
			id: true,
			name: true,
			month: true,
			orderStartDate: true,
			orderEndDate: true,
			dispatchStartDate: true,
			dispatchEndDate: true,
			isActive: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return (
		<FadeIn>
			<PostalOrderSettingsClient
				initialSettings={settingsData}
				currentMonth={currentMonth}
			/>
		</FadeIn>
	);
}
