import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import BrowserCompatibilityBanner from "@/components/ui/browser-compatibility-banner";
import { CartProvider } from "@/lib/cart-context";
import { Providers } from "./providers";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Dessert Ordering Platform",
	description: "Order custom desserts online",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Providers>
					<CartProvider>
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
