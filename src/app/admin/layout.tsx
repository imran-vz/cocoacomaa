import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Cocoa Comaa - Admin",
	description: "Admin dashboard for Cocoa Comaa",

	alternates: {
		canonical: "https://cocoacomaa.com",
		languages: { en: "https://cocoacomaa.com" },
	},
	authors: [{ name: "Imran", url: "https://imran.codes" }],

	applicationName: "Cocoa Comaa",
	creator: "Imran",
	keywords: ["cocoa-comaa", "brownie", "dessert", "order", "online"],
	openGraph: {
		title: "Cocoa Comaa - Admin",
		description: "Admin dashboard for Cocoa Comaa",
	},
};

export default async function AdminDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session || !["admin", "manager"].includes(session.user?.role || "")) {
		redirect("/");
	}

	return (
		<SidebarProvider>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 overflow-y-auto flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							{children}
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
