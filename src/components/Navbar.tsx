"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
	const { cartCount } = useCart();

	return (
		<nav className="bg-white shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					<div className="flex-shrink-0 flex items-center">
						<span className="text-2xl font-bold text-gray-800">
							Cocoa Comaa
						</span>
					</div>
					<div className="ml-4 flex items-center md:ml-6">
						<Button variant="outline" className="relative">
							<ShoppingCart className="h-6 w-6" />
							{cartCount > 0 && (
								<span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
									{cartCount}
								</span>
							)}
						</Button>
					</div>
				</div>
			</div>
		</nav>
	);
};
