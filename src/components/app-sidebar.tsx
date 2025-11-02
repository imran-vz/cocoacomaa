"use client";

import {
	CalendarIcon,
	HelpCircleIcon,
	HomeIcon,
	PackageIcon,
	SettingsIcon,
	ShoppingBagIcon,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type * as React from "react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const session = useSession();
	const pathname = usePathname();
	const { isMobile, setOpenMobile } = useSidebar();
	const isAdmin = session.data?.user?.role === "admin";
	const isManager = session.data?.user?.role === "manager";

	// Admin navigation structure
	const adminData = {
		user: {
			name: session.data?.user?.name || "Admin",
			email: session.data?.user?.email || "",
			avatar: session.data?.user?.image || "",
		},
		navMain: [
			{
				title: "Dashboard",
				url: "/admin",
				icon: HomeIcon,
			},
			{
				title: "Orders",
				url: "/admin/orders",
				icon: ShoppingBagIcon,
			},
			{
				title: "Workshop Orders",
				url: "/admin/workshop-orders",
				icon: CalendarIcon,
			},
		],
		navProducts: [
			{
				title: "Products",
				icon: PackageIcon,
				isActive:
					pathname.includes("/admin/desserts") ||
					pathname.includes("/admin/postal-brownies") ||
					pathname.includes("/admin/specials") ||
					pathname.includes("/admin/workshops"),
				url: "#",
				items: [
					{
						title: "Desserts",
						url: "/admin/desserts",
					},
					{
						title: "Postal Brownies",
						url: "/admin/postal-brownies",
					},
					{
						title: "Specials",
						url: "/admin/specials",
					},
					{
						title: "Workshops",
						url: "/admin/workshops",
					},
				],
			},
			{
				title: "Settings",
				icon: SettingsIcon,
				isActive: pathname.includes("/admin/settings"),
				url: "#",
				items: [
					{
						title: "Cake Order Settings",
						url: "/admin/settings/order-days",
					},
					{
						title: "Postal Order Settings",
						url: "/admin/settings/postal-orders",
					},
					{
						title: "Specials Settings",
						url: "/admin/settings/specials",
					},
				],
			},
		],
		navSecondary: [
			{
				title: "Help",
				url: "#",
				icon: HelpCircleIcon,
			},
		],
	};

	// Manager navigation structure (read-only access to orders)
	const managerData = {
		user: {
			name: session.data?.user?.name || "Manager",
			email: session.data?.user?.email || "",
			avatar: session.data?.user?.image || "",
		},
		navMain: [
			{
				title: "Dashboard",
				url: "/manager",
				icon: HomeIcon,
			},
			{
				title: "Orders",
				url: "/manager/orders",
				icon: ShoppingBagIcon,
			},
			{
				title: "Workshop Orders",
				url: "/manager/workshop-orders",
				icon: CalendarIcon,
			},
		],
	};

	// Select data based on user role
	const data = isAdmin ? adminData : isManager ? managerData : managerData;

	const handleLogoClick = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a
								href={isAdmin ? "/admin" : "/manager"}
								onClick={handleLogoClick}
							>
								<Image
									src="/logo.png"
									alt="Cocoa Comaa"
									width={32}
									height={32}
									className="h-5 w-5"
								/>
								<span className="text-base font-semibold">Cocoa Comaa</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				{isAdmin && adminData.navProducts && (
					<NavDocuments items={adminData.navProducts} />
				)}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
