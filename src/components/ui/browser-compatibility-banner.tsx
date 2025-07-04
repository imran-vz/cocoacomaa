"use client";

import { ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const isInAppBrowser = () => {
	if (typeof window === "undefined") return false;

	const userAgent = window.navigator.userAgent.toLowerCase();

	// Detect various in-app browsers
	const inAppBrowsers = [
		"instagram", // Instagram in-app browser
		"fban", // Facebook app browser
		"fbav", // Facebook app browser (alternative)
		"twitter", // Twitter in-app browser
		"tiktok", // TikTok in-app browser
		"linkedin", // LinkedIn in-app browser
		"snapchat", // Snapchat in-app browser
		"pinterest", // Pinterest in-app browser
		"whatsapp", // WhatsApp in-app browser
		"micromessenger", // WeChat browser
		"line", // Line app browser
		"telegram", // Telegram in-app browser
	];

	return inAppBrowsers.some((browser) => userAgent.includes(browser));
};

const getBrowserInstructions = () => {
	const isIOS = /ipad|iphone|ipod/.test(
		window.navigator.userAgent.toLowerCase(),
	);
	const isAndroid = /android/.test(window.navigator.userAgent.toLowerCase());

	if (isIOS) {
		return {
			browsers: ["Safari", "Chrome", "Brave"],
			instructions:
				"Tap the three dots (⋯) at the bottom right, then tap 'Open in Browser' or 'Open in Safari'.",
		};
	} else if (isAndroid) {
		return {
			browsers: ["Chrome", "Brave", "Firefox"],
			instructions:
				"Tap the three dots (⋮) menu, then tap 'Open in browser' or 'Open with Chrome'.",
		};
	} else {
		return {
			browsers: ["Chrome", "Safari", "Brave", "Firefox"],
			instructions:
				"Please copy this URL and open it in your preferred browser.",
		};
	}
};

export default function BrowserCompatibilityBanner() {
	const [showBanner, setShowBanner] = useState(false);
	const [browserInfo, setBrowserInfo] = useState<{
		browsers: string[];
		instructions: string;
	} | null>(null);
	const [bannerDismissed, setBannerDismissed] = useState(false);

	useEffect(() => {
		const checkBrowser = () => {
			if (isInAppBrowser()) {
				setShowBanner(true);
				setBrowserInfo(getBrowserInstructions());
			}
		};

		// Small delay to ensure proper detection
		const timer = setTimeout(checkBrowser, 500);
		return () => clearTimeout(timer);
	}, []);

	// Add/remove body padding when banner is shown/hidden
	useEffect(() => {
		if (showBanner) {
			document.body.style.paddingTop = "80px";
		} else {
			document.body.style.paddingTop = "";
		}

		if (sessionStorage.getItem("browser-banner-dismissed") === "true") {
			setBannerDismissed(true);
		}

		// Cleanup on unmount
		return () => {
			document.body.style.paddingTop = "";
		};
	}, [showBanner]);

	const handleDismiss = () => {
		setShowBanner(false);
		// Remember user's choice for this session
		sessionStorage.setItem("browser-banner-dismissed", "true");
	};

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			toast.success("URL copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy URL:", error);
			// Fallback: select the URL text
			const textArea = document.createElement("textarea");
			textArea.value = window.location.href;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
			toast.success("URL copied to clipboard!");
		}
	};

	// Don't show if dismissed in this session
	if (bannerDismissed) {
		return null;
	}

	if (!showBanner || !browserInfo) {
		return null;
	}

	return (
		<div className="fixed top-0 left-0 right-0 z-[1000] bg-blue-600 text-white shadow-lg">
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-start gap-3">
					<div className="flex-shrink-0 mt-0.5">
						<ExternalLink className="h-5 w-5" />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-semibold mb-1">
							For the best experience, open in your browser
						</h3>
						<p className="text-xs text-blue-100 mb-2 leading-relaxed">
							{browserInfo.instructions}
						</p>
						<div className="flex flex-wrap items-center gap-2 text-xs">
							<span className="text-blue-200">Recommended browsers:</span>
							{browserInfo.browsers.map((browser) => (
								<span
									key={browser}
									className="bg-blue-500 px-2 py-1 rounded text-white font-medium"
								>
									{browser}
								</span>
							))}
						</div>
					</div>
					<div className="flex-shrink-0 flex gap-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCopyUrl}
							className="text-white hover:bg-blue-500 text-xs h-8 px-2"
						>
							Copy URL
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleDismiss}
							className="text-white hover:bg-blue-500 p-1 h-8 w-8"
							aria-label="Dismiss"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
