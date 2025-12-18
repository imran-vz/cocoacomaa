"use client";

import { Home, LogOut, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export function ManagerNavigation() {
	const { data: session } = authClient.useSession();
	const pathname = usePathname();

	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = "/";
				},
			},
		});
	};

	return (
		<nav className="bg-background shadow-md border-b sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					{/* Logo */}
					<div className="shrink-0 flex items-center">
						<Link
							href={"/manager"}
							className="text-xl sm:text-2xl uppercase font-bold text-foreground"
						>
							Manager Portal
						</Link>
					</div>

					{/* Navigation Links */}
					<div className="hidden md:flex items-center gap-4">
						<Button
							variant={pathname === "/manager" ? "default" : "ghost"}
							asChild
						>
							<Link href="/manager" className="flex items-center gap-2">
								<Home className="h-4 w-4" />
								Dashboard
							</Link>
						</Button>
						<Button
							variant={
								pathname.startsWith("/manager/orders") ? "default" : "ghost"
							}
							asChild
						>
							<Link href="/manager/orders" className="flex items-center gap-2">
								<ShoppingBag className="h-4 w-4" />
								Orders
							</Link>
						</Button>
					</div>

					{/* Right side */}
					<div className="flex items-center gap-2">
						<ThemeToggle />

						{session?.user?.id && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={session.user.image || undefined}
												alt={session.user.name || "User"}
											/>
											<AvatarFallback>
												{session.user.name
													? session.user.name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.toUpperCase()
															.slice(0, 2)
													: "M"}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<div className="flex items-center justify-start gap-2 p-2">
										<div className="flex flex-col space-y-1 leading-none">
											{session.user.name && (
												<p className="font-medium">{session.user.name}</p>
											)}
											{session.user.email && (
												<p className="w-[200px] truncate text-sm text-muted-foreground">
													{session.user.email}
												</p>
											)}
										</div>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild className="md:hidden">
										<Link href="/manager" className="flex items-center gap-2">
											<Home className="h-4 w-4" />
											Dashboard
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild className="md:hidden">
										<Link
											href="/manager/orders"
											className="flex items-center gap-2"
										>
											<ShoppingBag className="h-4 w-4" />
											Orders
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator className="md:hidden" />
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
