"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navigation() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();
	const session = useSession();
	const { items } = useCart();

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const itemCount = items.reduce((total, item) => total + item.quantity, 0);
	const isLogin = pathname.startsWith("/login");
	const isAdmin = !!session.data?.user;

	if (isLogin) return null;

	return (
		<nav className="bg-white shadow-md border-b sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					{/* Logo */}
					<div className="shrink-0 flex items-center">
						<Link
							href={isAdmin ? "/admin" : "/"}
							className="text-xl sm:text-2xl uppercase font-bold text-gray-800"
						>
							Cocoa Comaa
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-4">
						{isAdmin ? (
							<>
								<Button variant="ghost" asChild>
									<Link href="/admin/orders">Orders</Link>
								</Button>
								<Button variant="ghost" asChild>
									<Link href="/admin/desserts">Desserts</Link>
								</Button>
							</>
						) : (
							<>
								<Button variant="ghost" asChild>
									<Link href="/">Home</Link>
								</Button>
								<Button variant="ghost" asChild>
									<Link href="/order">Order</Link>
								</Button>
							</>
						)}
						<Button variant="outline" asChild className="relative">
							<Link href="/order" className="flex items-center">
								<ShoppingCart className="h-4 w-4 mr-2" />
								Cart
								{itemCount > 0 && (
									<Badge
										variant="destructive"
										className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
									>
										{itemCount}
									</Badge>
								)}
							</Link>
						</Button>
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden flex items-center space-x-2">
						{/* Mobile Cart */}
						<Button variant="outline" asChild size="icon" className="relative">
							<Link href="/order">
								<ShoppingCart className="h-4 w-4" />
								{itemCount > 0 && (
									<Badge
										variant="destructive"
										className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
									>
										{itemCount}
									</Badge>
								)}
							</Link>
						</Button>

						{/* Hamburger Menu Button */}
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleMenu}
							aria-label="Toggle menu"
						>
							{isMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden border-t bg-white">
						{isAdmin ? (
							<div className="px-2 pt-2 pb-3 space-y-1">
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									onClick={() => setIsMenuOpen(false)}
								>
									<Link href="/admin/orders">Orders</Link>
								</Button>
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									onClick={() => setIsMenuOpen(false)}
								>
									<Link href="/admin/desserts">Desserts</Link>
								</Button>
							</div>
						) : (
							<div className="px-2 pt-2 pb-3 space-y-1">
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									onClick={() => setIsMenuOpen(false)}
								>
									<Link href="/">Home</Link>
								</Button>
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									onClick={() => setIsMenuOpen(false)}
								>
									<Link href="/order">Order</Link>
								</Button>
							</div>
						)}
					</div>
				)}
			</div>
		</nav>
	);
}
