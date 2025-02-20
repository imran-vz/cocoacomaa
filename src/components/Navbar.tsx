"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
	return (
		<nav className="bg-white shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					<div className="flex-shrink-0 flex items-center">
						<span className="text-2xl uppercase font-bold text-gray-800">
							Cocoa Comaa
						</span>
					</div>
				</div>
			</div>
		</nav>
	);
};
