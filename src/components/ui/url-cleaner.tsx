"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const FACEBOOK_INSTAGRAM_PARAMS = [
	// Facebook parameters
	"fbclid",
	"fbqid",
	"mc_eid",
	"ml_subscriber",
	"ml_subscriber_hash",
	"fb_action_ids",
	"fb_action_types",
	"fb_source",
	"fb_ref",
	"fbref",
	"fblid",
	"_fb_noscript",

	// Instagram parameters
	"igshid",
	"igsh",
	"ig_rid",
	"ig_cache_key",
	"ig_web_copy_link",
];

export default function UrlCleaner() {
	const router = useRouter();

	useEffect(() => {
		const cleanUrl = () => {
			const currentUrl = new URL(window.location.href);
			const urlParams = new URLSearchParams(currentUrl.search);
			let hasTracking = false;

			// Check if any tracking parameters exist
			FACEBOOK_INSTAGRAM_PARAMS.forEach((param: string) => {
				if (urlParams.has(param)) {
					urlParams.delete(param);
					hasTracking = true;
				}
			});

			// If tracking parameters were found and removed, update the URL
			if (hasTracking) {
				const cleanedUrl = `${currentUrl.pathname}${urlParams.toString() ? "?" + urlParams.toString() : ""}`;

				// Use router.replace to update URL without page refresh and without adding to history
				router.replace(cleanedUrl);
			}
		};

		// Small delay to ensure proper initialization
		const timer = setTimeout(cleanUrl, 100);
		return () => clearTimeout(timer);
	}, [router]);

	// This component doesn't render anything
	return null;
}
