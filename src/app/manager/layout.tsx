import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ManagerNavigation } from "@/components/manager-navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Cocoa Comaa - Manager",
	description: "Manager dashboard for Cocoa Comaa",

	alternates: {
		canonical: "https://cocoacomaa.com",
		languages: { en: "https://cocoacomaa.com" },
	},
	authors: [{ name: "Imran", url: "https://imran.codes" }],

	applicationName: "Cocoa Comaa",
	creator: "Imran",
	keywords: ["cocoa-comaa", "brownie", "dessert", "order", "online"],
	openGraph: {
		title: "Cocoa Comaa - Manager",
		description: "Manager dashboard for Cocoa Comaa",
	},
};

export default async function ManagerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session || session.user?.role !== "manager") {
		redirect("/");
	}

	return (
		<>
			<ManagerNavigation />
			{children}
		</>
	);
}
