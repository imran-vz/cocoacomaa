import "./globals.css";
import { Montserrat, Playfair_Display } from "next/font/google";

const montserrat = Montserrat({
	subsets: ["latin"],
	variable: "--font-montserrat",
	weight: ["400", "500"],
	fallback: ["sans-serif"],
	preload: true,
	display: "swap",
});

const serif = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-serif",
	weight: ["400"],
	fallback: ["serif"],
	preload: true,
	display: "swap",
});

export const metadata = {
	title: "Dessert Shop",
	description: "A delicious selection of desserts",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${montserrat.variable} ${serif.variable}`}>
				{children}
			</body>
		</html>
	);
}
