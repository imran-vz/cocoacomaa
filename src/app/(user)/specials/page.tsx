import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchDesserts } from "@/lib/db/dessert";
import { fetchSpecialsSettings } from "@/lib/db/specials";
import SpecialsClientPage from "./specials-client-page";

export default async function SpecialsLoading() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login?redirect=/specials");
	}

	const [initialSpecials, initialSettings] = await Promise.all([
		fetchDesserts(["special"]),
		fetchSpecialsSettings(),
	]);

	return (
		<SpecialsClientPage
			initialSpecials={initialSpecials}
			initialSettings={initialSettings}
		/>
	);
}
