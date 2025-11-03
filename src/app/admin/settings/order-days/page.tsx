import { FadeIn } from "@/components/fade-in";
import { db } from "@/lib/db";
import { OrderDaysSettingsClient } from "./_components/order-days-settings-client";

export default async function CakeOrderDaysSettingsPage() {
	// Fetch initial settings on server
	const settingsData = await db.query.cakeOrderSettings.findFirst({
		orderBy: (cakeOrderSettings, { desc }) => [desc(cakeOrderSettings.id)],
		columns: {
			id: true,
			allowedDays: true,
			isActive: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	// Default settings if none exist
	const initialSettings = settingsData ?? {
		id: 0,
		allowedDays: [1, 2], // Monday and Tuesday
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return (
		<FadeIn>
			<OrderDaysSettingsClient initialSettings={initialSettings} />
		</FadeIn>
	);
}
