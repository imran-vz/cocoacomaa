import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "sonner";
import { Navigation } from "@/components/Navigation";

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
				<CartProvider>
					<Navigation />
					{children}
					<Toaster />
				</CartProvider>
			</body>
		</html>
	);
}
