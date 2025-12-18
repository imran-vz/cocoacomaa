import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import Footer from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { StructuredData } from "@/components/structured-data";
import BrowserCompatibilityBanner from "@/components/ui/browser-compatibility-banner";
import { Toaster } from "@/components/ui/sonner";
import UrlCleaner from "@/components/ui/url-cleaner";
import { CartProvider } from "@/lib/cart-context";
import {
	generateLocalBusinessSchema,
	generateOrganizationSchema,
} from "@/lib/seo/structured-data";
import { Providers } from "./providers";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
	metadataBase: new URL("https://cocoacomaa.com"),
	title: {
		default: "Cocoa Comaa | Best Brownies in Bangalore & Custom Desserts",
		template: "%s | Cocoa Comaa",
	},
	description:
		"Order fudgy Brownies, cakes & desserts in Bengaluru. Baking workshops available. Same-day delivery in Koramangala. Postal brownies shipped across India.",

	alternates: {
		canonical: "https://cocoacomaa.com",
		languages: { en: "https://cocoacomaa.com" },
	},
	authors: [{ name: "Imran", url: "https://imran.codes" }],

	applicationName: "Cocoa Comaa",
	creator: "Imran",
	keywords: [
		"brownies in bangalore",
		"bengaluru brownies",
		"custom cakes bengaluru",
		"koramangala bakery",
		"baking workshops",
		"fudgy brownies",
		"postal brownies india",
		"custom desserts",
		"bengaluru bakery",
		"koramangala desserts",
		"online cake order bengaluru",
	],

	openGraph: {
		type: "website",
		locale: "en_IN",
		url: "https://cocoacomaa.com",
		siteName: "Cocoa Comaa",
		title: "Cocoa Comaa | Fudgy Brownies & Desserts in Bengaluru",
		description:
			"Order fudgy Brownies, cakes & desserts in Bengaluru. Baking workshops available. Same-day delivery in Koramangala.",
	},

	twitter: {
		card: "summary_large_image",
		title: "Cocoa Comaa | Fudgy Brownies & Desserts in Bengaluru",
		description:
			"Order fudgy Brownies, cakes & desserts in Bengaluru. Baking workshops available. Same-day delivery in Koramangala.",
	},

	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Cocoa Comaa",
	},

	icons: {
		icon: [
			{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
	},
};

export const viewport: Viewport = {
	themeColor: { media: "(prefers-color-scheme: dark)", color: "#502922" },
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<StructuredData
					data={[generateLocalBusinessSchema(), generateOrganizationSchema()]}
				/>
			</head>
			<body className={inter.className}>
				<Analytics />
				<Providers>
					<CartProvider>
						<UrlCleaner />
						<BrowserCompatibilityBanner />
						<Navigation />
						{children}
						<Footer />
						<Toaster richColors />
					</CartProvider>
				</Providers>
			</body>
		</html>
	);
}
