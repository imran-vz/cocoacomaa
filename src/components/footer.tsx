"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
	const pathname = usePathname();
	if (pathname.includes("/admin") || pathname.includes("/manager")) return null;

	return (
		<footer className="bg-card text-foreground py-8 px-4 border-t border-border">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
					{/* Legal Links */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg font-serif">Legal</h3>
						<div className="flex flex-col space-y-2">
							<Link
								href="/terms-of-use"
								className="text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								Terms of Use
							</Link>
							<Link
								href="/terms-of-sale"
								className="text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								Terms of Sale
							</Link>
							<Link
								href="/data-protection"
								className="text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								Data Protection
							</Link>
						</div>
					</div>

					{/* Company Links */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg font-serif">Company</h3>
						<div className="flex flex-col space-y-2">
							<Link
								href="/about"
								className="text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								About Us
							</Link>
							<Link
								href="/contact-us"
								className="text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								Contact Us
							</Link>
							<a
								href="https://www.instagram.com/cocoa_comaa/"
								target="_blank"
								rel="noreferrer"
								className="text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								Instagram
							</a>
						</div>
					</div>

					{/* Contact Info */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg font-serif">Contact</h3>
						<div className="flex flex-col space-y-2 text-muted-foreground">
							<p className="text-sm">Email: contact@cocoacomaa.com</p>
							<p className="text-sm">
								Phone: {process.env.NEXT_PUBLIC_BUSINESS_PHONE}
							</p>
							<p className="text-sm">Hours: Wed-Sun, 9 AM - 6 PM</p>
						</div>
					</div>
				</div>

				<div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
					&copy; {new Date().getFullYear()} Cocoa Comaa. All rights reserved.
				</div>
			</div>
		</footer>
	);
}
