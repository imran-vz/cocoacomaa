import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ManagerNavigation } from "@/components/manager-navigation";

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
	const session = await auth();

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
