import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { fetchDesserts } from "@/lib/db/dessert";
import OrderClientPage from "./order-client-page";

export const metadata: Metadata = {
	title: "Order Custom Cakes & Desserts Online | Bengaluru",
	description:
		"Browse our menu of custom cakes, fudgy brownies, and desserts in Bengaluru. Same-day delivery available in Koramangala. Order online for special occasions.",
	keywords: [
		"custom cakes bengaluru",
		"order brownies online",
		"bengaluru desserts",
		"koramangala bakery",
		"custom birthday cakes",
		"online cake delivery",
	],
	openGraph: {
		title: "Order Custom Cakes & Desserts Online | Bengaluru | Cocoa Comaa",
		description:
			"Browse our menu of custom cakes, fudgy brownies, and desserts. Same-day delivery in Koramangala.",
	},
};

export default async function OrderPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	const initialDesserts = await fetchDesserts();

	return (
		<OrderClientPage
			initialDesserts={initialDesserts}
			isAuthenticated={!!session?.user?.id}
		/>
	);
}
