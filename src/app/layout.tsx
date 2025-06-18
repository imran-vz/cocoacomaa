import { Navigation } from "@/components/Navigation";
import { CartProvider } from "@/lib/cart-context";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";
import Link from "next/link";

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
