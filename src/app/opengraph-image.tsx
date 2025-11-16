import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Cocoa Comaa - Fudgy Brownies & Desserts in Bengaluru";
export const size = {
	width: 1200,
	height: 630,
};

export const contentType = "image/png";

export default async function Image() {
	const logoUrl = new URL(
		"/logo.png",
		process.env.NEXT_PUBLIC_BASE_URL || "https://cocoacomaa.com",
	).toString();

	const interBold = await fetch(
		new URL(
			"/Inter-Bold.ttf",
			process.env.NEXT_PUBLIC_BASE_URL || "https://cocoacomaa.com",
		),
	).then((res) => res.arrayBuffer());

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#502922",
				backgroundImage: "linear-gradient(135deg, #502922 0%, #3d1f1a 100%)",
				fontFamily: "Inter",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: "32px",
				}}
			>
				{/** biome-ignore lint/performance/noImgElement: OG image generation with next/og requires img element */}
				<img
					src={logoUrl}
					alt="Cocoa Comaa Logo"
					width="120"
					height="120"
					style={{
						borderRadius: "20px",
					}}
				/>
				<h1
					style={{
						fontSize: "80px",
						fontWeight: "bold",
						color: "white",
						margin: 0,
						textAlign: "center",
						letterSpacing: "-0.02em",
					}}
				>
					Cocoa Comaa
				</h1>
				<p
					style={{
						fontSize: "48px",
						color: "#f5f5f5",
						margin: 0,
						textAlign: "center",
						fontStyle: "italic",
						opacity: 0.95,
					}}
				>
					Fudgy. Messy. Unforgettable.
				</p>
				<div
					style={{
						display: "flex",
						gap: "24px",
						marginTop: "24px",
						fontSize: "28px",
						color: "#e5e5e5",
					}}
				>
					<span>Brownies</span>
					<span style={{ opacity: 0.5 }}>•</span>
					<span>Cakes</span>
					<span style={{ opacity: 0.5 }}>•</span>
					<span>Workshops</span>
				</div>
				<p
					style={{
						fontSize: "24px",
						color: "#d4d4d4",
						margin: 0,
						marginTop: "16px",
					}}
				>
					📍 Koramangala, Bengaluru
				</p>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{
					name: "Inter",
					data: interBold,
					style: "normal",
					weight: 700,
				},
			],
		},
	);
}
