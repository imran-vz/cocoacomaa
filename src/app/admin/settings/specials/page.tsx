import { FadeIn } from "@/components/fade-in";
import { fetchSpecialsSettings } from "@/lib/db/specials";
import { SpecialsSettingsClient } from "./_components/specials-settings-client";

export default async function SpecialsSettingsPage() {
	// Fetch initial settings on server
	const initialSettings = await fetchSpecialsSettings();

	return (
		<FadeIn>
			<SpecialsSettingsClient initialSettings={initialSettings} />
		</FadeIn>
	);
}
