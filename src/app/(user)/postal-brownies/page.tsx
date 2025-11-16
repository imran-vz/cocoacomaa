import { format } from "date-fns";
import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { postalCombos, postalOrderSettings } from "@/lib/db/schema";
import PostalBrowniesClient from "./_components/postal-brownies-client";

export const metadata: Metadata = {
	title: "Send Gourmet Brownies Anywhere in India | Postal Brownies",
	description:
		"Send our signature fudgy brownies across India. Perfect gift boxes with custom combos. Order online for nationwide delivery from Bengaluru's favorite brownie shop.",
	keywords: [
		"postal brownies india",
		"brownies delivery india",
		"gift box brownies",
		"send brownies online",
		"gourmet brownies delivery",
		"brownie gift hamper",
	],
	openGraph: {
		title:
			"Send Gourmet Brownies Anywhere in India | Postal Brownies | Cocoa Comaa",
		description:
			"Send our signature fudgy brownies across India. Perfect gift boxes with custom combos.",
	},
};

export default async function Page() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login?redirect=/postal-brownies");
	}

	const [postalCombosList, settings] = await Promise.all([
		db.query.postalCombos.findMany({
			orderBy: (postalCombos, { asc }) => [asc(postalCombos.createdAt)],
			where: and(
				eq(postalCombos.isDeleted, false),
				eq(postalCombos.status, "available"),
			),
		}),
		db.query.postalOrderSettings.findMany({
			where: and(
				eq(postalOrderSettings.month, format(new Date(), "yyyy-MM")),
				eq(postalOrderSettings.isActive, true),
			),
			orderBy: (postalOrderSettings, { desc }) => [
				desc(postalOrderSettings.createdAt),
			],
		}),
	]);

	return (
		<PostalBrowniesClient
			postalCombosList={postalCombosList}
			settings={settings}
		/>
	);
}
