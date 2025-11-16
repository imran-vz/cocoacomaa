import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchDesserts } from "@/lib/db/dessert";
import { fetchSpecialsSettings } from "@/lib/db/specials";
import SpecialsClientPage from "./specials-client-page";

export const metadata: Metadata = {
	title: "Special Desserts & Seasonal Menu",
	description:
		"Explore our special desserts and seasonal creations. Limited-time offerings of unique cakes and desserts in Bengaluru. Order now while supplies last!",
	keywords: [
		"special desserts bengaluru",
		"seasonal cakes",
		"limited edition brownies",
		"festive desserts",
		"special occasion cakes",
		"unique desserts koramangala",
	],
	openGraph: {
		title: "Special Desserts & Seasonal Menu | Cocoa Comaa",
		description:
			"Explore our special desserts and seasonal creations. Limited-time offerings in Bengaluru.",
	},
};

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
