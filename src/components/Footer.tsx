"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
	const pathname = usePathname();
	if (pathname.startsWith("/admin")) return null;

	return (
		<footer className="bg-secondary text-primary py-8">
			<div className="max-w-2xl mx-auto flex flex-col items-center space-y-2">
				<div className="flex space-x-4">
					<Link
						href="/terms-and-conditions"
						className="underline hover:text-secondary-foreground"
					>
						Terms & Conditions
					</Link>
					<Link
						href="/contact-us"
						className="underline hover:text-secondary-foreground"
					>
						Contact Us
					</Link>
					<Link
						href="/data-protection"
						className="underline hover:text-secondary-foreground"
					>
						Data Protection
					</Link>
				</div>

				<div className="text-xs text-center">
					&copy; {new Date().getFullYear()} Cocoa Comaa. All rights reserved.
				</div>
			</div>
		</footer>
	);
}

export default Footer;
