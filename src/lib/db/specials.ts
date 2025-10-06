import { db } from ".";

export async function fetchSpecialsSettings() {
	const currentSettings = await db.query.specialsSettings.findFirst({
		orderBy: (specialsSettings, { desc }) => [desc(specialsSettings.id)],
	});

	// If no settings exist, return default
	const defaultSettings = {
		id: 0,
		isActive: false,
		pickupStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split("T")[0], // 7 days from now
		pickupEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split("T")[0], // 14 days from now
		pickupStartTime: "10:00",
		pickupEndTime: "18:00",
		description: "",
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return currentSettings || defaultSettings;
}
