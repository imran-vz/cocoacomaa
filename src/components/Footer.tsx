"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
	const pathname = usePathname();
	if (pathname.startsWith("/admin")) return null;

	return (
		<footer className="bg-secondary text-primary py-8 px-4">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
					{/* Legal Links */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg">Legal</h3>
						<div className="flex flex-col space-y-2">
							<Link
								href="/terms-of-use"
								className="text-sm hover:text-secondary-foreground transition-colors"
							>
								Terms of Use
							</Link>
							<Link
								href="/terms-of-sale"
								className="text-sm hover:text-secondary-foreground transition-colors"
							>
								Terms of Sale
							</Link>
							<Link
								href="/data-protection"
								className="text-sm hover:text-secondary-foreground transition-colors"
							>
								Data Protection
							</Link>
						</div>
					</div>

					{/* Company Links */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg">Company</h3>
						<div className="flex flex-col space-y-2">
							<Link
								href="/about"
								className="text-sm hover:text-secondary-foreground transition-colors"
							>
								About Us
							</Link>
							<Link
								href="/contact-us"
								className="text-sm hover:text-secondary-foreground transition-colors"
							>
								Contact Us
							</Link>
							<a
								href="https://www.instagram.com/cocoa_comaa/"
								target="_blank"
								rel="noreferrer"
								className="text-sm hover:text-secondary-foreground transition-colors"
							>
								Instagram
							</a>
						</div>
					</div>

					{/* Contact Info */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg">Contact</h3>
						<div className="flex flex-col space-y-2">
							<p className="text-sm">Email: contact@cocoacomaa.com</p>
							<p className="text-sm">
								Phone: {process.env.NEXT_PUBLIC_BUSINESS_PHONE}
							</p>
							<p className="text-sm">Hours: Wed-Sun, 9 AM - 6 PM</p>
						</div>
					</div>
				</div>

				<div className="text-center text-sm text-muted-foreground pt-8 border-t">
					&copy; {new Date().getFullYear()} Cocoa Comaa. All rights reserved.
				</div>
			</div>
		</footer>
	);
}

export default Footer;
