"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function Navigation() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const session = useSession();

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const isAdmin = session.data?.user?.role === "admin";

	const handleLogout = async () => {
		await signOut({ callbackUrl: "/" });
		setIsMenuOpen(false);
	};

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
								<Button variant="ghost" asChild>
									<Link href="/admin/postal-brownies">Postal Brownies</Link>
								</Button>
								<Button variant="ghost" asChild>
									<Link href="/admin/settings/order-days">Order Settings</Link>
								</Button>
								<Button
									variant="ghost"
									onClick={handleLogout}
									className="text-red-600 hover:text-red-700"
								>
									<LogOut className="h-4 w-4 mr-2" />
									Logout
								</Button>
							</>
						) : (
							<>
								<Button variant="ghost" asChild>
									<Link href="/">Home</Link>
								</Button>

								{!session.data?.user?.id ? (
									<Button variant="ghost" asChild>
										<Link href="/login">Login</Link>
									</Button>
								) : (
									<>
										<Button variant="ghost" asChild>
											<Link href="/my-orders">My Orders</Link>
										</Button>
										<Button
											variant="ghost"
											onClick={handleLogout}
											className="text-red-600 hover:text-red-700"
										>
											<LogOut className="h-4 w-4 mr-2" />
											Logout
										</Button>
									</>
								)}
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden flex items-center space-x-2">
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
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									onClick={() => setIsMenuOpen(false)}
								>
									<Link href="/admin/postal-brownies">Postal Brownies</Link>
								</Button>
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									onClick={() => setIsMenuOpen(false)}
								>
									<Link href="/admin/settings/order-days">Order Settings</Link>
								</Button>
								<Button
									variant="ghost"
									onClick={handleLogout}
									className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									<LogOut className="h-4 w-4 mr-2" />
									Logout
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
								{session.data?.user?.id ? (
									<>
										<Button
											variant="ghost"
											asChild
											className="w-full justify-start"
											onClick={() => setIsMenuOpen(false)}
										>
											<Link href="/my-orders">My Orders</Link>
										</Button>
										<Button
											variant="ghost"
											onClick={handleLogout}
											className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
										>
											<LogOut className="h-4 w-4 mr-2" />
											Logout
										</Button>
									</>
								) : null}
							</div>
						)}
					</div>
				)}
			</div>
		</nav>
	);
}
