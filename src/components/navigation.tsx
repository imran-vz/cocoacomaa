"use client";

import { LogOut, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { CartPopover } from "@/components/cart-popover";
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
import { useCakeOrderSettings } from "@/hooks/use-order-settings";
import { Skeleton } from "./ui/skeleton";

export function Navigation() {
	const session = useSession();
	const router = useRouter();
	const pathname = usePathname();
	const isAdminPage = pathname.startsWith("/admin");
	const isManagerPage = pathname.startsWith("/manager");
	const isAdmin = session.data?.user?.role === "admin";
	const isManager = session.data?.user?.role === "manager";
	const isOrderPage = pathname === "/order";
	const isSpecialsPage = pathname === "/specials";
	const showCart = isOrderPage || isSpecialsPage;
	const { areOrdersAllowed: ordersAllowed, settings } = useCakeOrderSettings();

	const handleLogout = async () => {
		await signOut({ callbackUrl: "/" });
	};

	const handleCheckout = () => {
		if (isOrderPage) {
			if (!ordersAllowed) {
				const isSystemDisabled = !settings?.isActive;
				if (isSystemDisabled) {
					toast.error("Cake order system is currently disabled");
				} else {
					toast.error("Cake orders are only accepted on allowed days");
				}
				return;
			}
		} else if (isSpecialsPage) {
			if (!session.data?.user?.id) {
				router.push("/login?redirect=/specials");
				return;
			}
		}
		router.push("/checkout");
	};

	if (isAdminPage || isManagerPage) {
		return null;
	}

	return (
		<nav className="bg-background shadow-md border-b sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					{/* Logo */}
					<div className="shrink-0 flex items-center">
						<Link
							href={"/"}
							className="text-xl sm:text-2xl uppercase font-bold text-foreground"
						>
							Cocoa Comaa
						</Link>
					</div>

					<div className="ml-auto mr-4 flex items-center gap-2">
						{session.status === "loading" ? (
							<Skeleton className="h-8 w-24" />
						) : isAdmin ? (
							<Button asChild variant="secondary">
								<Link href="/admin">Dashboard</Link>
							</Button>
						) : isManager ? (
							<Button asChild variant="secondary">
								<Link href="/manager">Dashboard</Link>
							</Button>
						) : null}
						{showCart && (
							<CartPopover
								onCheckout={handleCheckout}
								disabled={isOrderPage && !ordersAllowed}
								checkoutLabel={
									isOrderPage && !ordersAllowed
										? "Cake Orders Unavailable"
										: "Proceed to Checkout"
								}
							/>
						)}
						<ThemeToggle />
					</div>
					{/* Navigation */}
					<div className="flex items-center space-x-4">
						{session.status === "loading" ? (
							<Skeleton className="h-8 w-8" />
						) : !session.data?.user?.id ? (
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
									{isManager || isAdmin ? null : (
										<>
											<DropdownMenuItem asChild>
												<Link
													href="/my-orders"
													className="flex items-center gap-2"
												>
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
										</>
									)}
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
