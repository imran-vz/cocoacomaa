"use client";

import { LogOut, Menu, Settings, ShoppingBag, Users, X } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
									<Link href="/admin">Dashboard</Link>
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="relative h-8 w-8 rounded-full"
										>
											<Avatar className="h-8 w-8">
												<AvatarFallback>AD</AvatarFallback>
											</Avatar>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56">
										<DropdownMenuGroup>
											<DropdownMenuLabel>Manage</DropdownMenuLabel>
											<DropdownMenuItem asChild>
												<Link
													href="/admin/orders"
													className="flex items-center gap-2"
												>
													<ShoppingBag className="h-4 w-4" />
													Orders
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href="/admin/workshop-orders"
													className="flex items-center gap-2"
												>
													<ShoppingBag className="h-4 w-4" />
													Workshop Orders
												</Link>
											</DropdownMenuItem>
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuLabel>Products</DropdownMenuLabel>

											<DropdownMenuItem asChild>
												<Link
													href="/admin/desserts"
													className="flex items-center gap-2"
												>
													<Settings className="h-4 w-4" />
													Desserts
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href="/admin/postal-brownies"
													className="flex items-center gap-2"
												>
													<Settings className="h-4 w-4" />
													Postal Brownies
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href="/admin/workshops"
													className="flex items-center gap-2"
												>
													<Users className="h-4 w-4" />
													Workshops
												</Link>
											</DropdownMenuItem>
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuLabel>Settings</DropdownMenuLabel>
											<DropdownMenuItem asChild>
												<Link
													href="/admin/settings/order-days"
													className="flex items-center gap-2"
												>
													<Settings className="h-4 w-4" />
													Cake Order Settings
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href="/admin/settings/postal-orders"
													className="flex items-center gap-2"
												>
													<Settings className="h-4 w-4" />
													Postal Order Settings
												</Link>
											</DropdownMenuItem>
										</DropdownMenuGroup>
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
							</>
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
									<Link href="/admin/workshops">Workshops</Link>
								</Button>
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									onClick={() => setIsMenuOpen(false)}
								>
									<Link href="/admin/workshop-orders">Workshop Orders</Link>
								</Button>
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									onClick={() => setIsMenuOpen(false)}
								>
									<Link href="/admin/settings/order-days">
										Cake Order Settings
									</Link>
								</Button>
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									onClick={() => setIsMenuOpen(false)}
								>
									<Link href="/admin/settings/postal-orders">
										Postal Order Settings
									</Link>
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
											<Link href="/workshops">Workshops</Link>
										</Button>
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
											asChild
											className="w-full justify-start"
											onClick={() => setIsMenuOpen(false)}
										>
											<Link href="/my-workshops">My Workshops</Link>
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
								) : (
									<Button variant="ghost" asChild>
										<Link href="/login">Login</Link>
									</Button>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</nav>
	);
}
