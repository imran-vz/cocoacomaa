import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Cocoa Comaa",
		short_name: "CC",
		description: "Order desserts and brownies from Cocoa Comaa",
		start_url: "/?source=pwa",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#502922",
		orientation: "portrait-primary",
		scope: "/",
		icons: [
			{
				src: "/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icon-256x256.png",
				sizes: "256x256",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icon-384x384.png",
				sizes: "384x384",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
