import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import BrowserCompatibilityBanner from "@/components/ui/browser-compatibility-banner";
import UrlCleaner from "@/components/ui/url-cleaner";
import { CartProvider } from "@/lib/cart-context";
import { Providers } from "./providers";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
	title: "Cocoa Comaa",
	description: "Order custom desserts online",

	alternates: {
		canonical: "https://cocoacomaa.com",
		languages: { en: "https://cocoacomaa.com" },
	},
	authors: [{ name: "Imran", url: "https://imran.codes" }],

	applicationName: "Cocoa Comaa",
	creator: "Imran",
	keywords: ["cocoa-comaa", "brownie", "dessert", "order", "online"],
	openGraph: {
		title: "Cocoa Comaa",
		description: "Order custom desserts online",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Analytics />
				<Providers>
					<CartProvider>
						<UrlCleaner />
						<BrowserCompatibilityBanner />
						<Navigation />
						{children}
						<Footer />
						<Toaster />
					</CartProvider>
				</Providers>
			</body>
		</html>
	);
}
