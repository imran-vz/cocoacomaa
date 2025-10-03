"use client";

import { LogOut, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
	const session = useSession();
	const pathname = usePathname();
	const isAdminPage = pathname.startsWith("/admin");
	const isManagerPage = pathname.startsWith("/manager");
	const isAdmin = session.data?.user?.role === "admin";
	const isManager = session.data?.user?.role === "manager";

	const handleLogout = async () => {
		await signOut({ callbackUrl: "/" });
	};

	if (isAdminPage || isManagerPage) {
		return null;
	}

	return (
		<nav className="bg-white shadow-md border-b sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					{/* Logo */}
					<div className="shrink-0 flex items-center">
						<Link
							href={"/"}
							className="text-xl sm:text-2xl uppercase font-bold text-gray-800"
						>
							Cocoa Comaa
						</Link>
					</div>

					<div className="ml-auto mr-4">
						{isAdmin ? (
							<Button asChild variant="secondary">
								<Link href="/admin">Dashboard</Link>
							</Button>
						) : isManager ? (
							<Button asChild variant="secondary">
								<Link href="/manager">Dashboard</Link>
							</Button>
						) : null}
					</div>
					{/* Navigation */}
					<div className="flex items-center space-x-4">
						{!session.data?.user?.id ? (
							<Button variant="ghost" asChild>
								<Link href="/login">Login</Link>
							</Button>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={session.data.user.image || undefined}
												alt={session.data.user.name || "User"}
											/>
											<AvatarFallback>
												{session.data.user.name
													? session.data.user.name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.toUpperCase()
															.slice(0, 2)
													: "U"}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem asChild>
										<Link href="/my-orders" className="flex items-center gap-2">
											<ShoppingBag className="h-4 w-4" />
											My Orders
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											href="/my-workshops"
											className="flex items-center gap-2"
										>
											<Users className="h-4 w-4" />
											My Workshops
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogout}
										className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
									>
										<LogOut className="h-4 w-4 mr-2" />
										Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
