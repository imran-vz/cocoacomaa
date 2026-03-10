"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RazorpayOptions } from "@/types/razorpay";

declare global {
	interface Window {
		Razorpay: new (
			options: RazorpayOptions,
		) => {
			open: () => void;
			on: (event: string, callback: (error: Error) => void) => void;
		};
	}
}

interface UseRazorpayReturn {
	/** Whether the Razorpay script is loaded and ready */
	isReady: boolean;
	/** Whether the script failed to load */
	hasError: boolean;
	/** Open the Razorpay checkout modal */
	openCheckout: (options: RazorpayOptions) => void;
}

/**
 * Hook for loading and interacting with the Razorpay checkout.
 * Handles script loading, cleanup, and provides a simple API to open the checkout modal.
 */
export function useRazorpay(): UseRazorpayReturn {
	const [isReady, setIsReady] = useState(false);
	const [hasError, setHasError] = useState(false);
	const scriptRef = useRef<HTMLScriptElement | null>(null);

	useEffect(() => {
		// Check if already loaded
		if (window.Razorpay) {
			setIsReady(true);
			return;
		}

		// Check if script already exists in DOM
		const existingScript = document.querySelector(
			'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
		);
		if (existingScript) {
			existingScript.addEventListener("load", () => setIsReady(true));
			existingScript.addEventListener("error", () => setHasError(true));
			return;
		}

		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		script.onload = () => setIsReady(true);
		script.onerror = () => setHasError(true);
		document.body.appendChild(script);
		scriptRef.current = script;

		return () => {
			if (scriptRef.current && document.body.contains(scriptRef.current)) {
				document.body.removeChild(scriptRef.current);
				scriptRef.current = null;
			}
		};
	}, []);

	const openCheckout = useCallback(
		(options: RazorpayOptions) => {
			if (!isReady || !window.Razorpay) {
				console.error("Razorpay is not loaded yet");
				return;
			}
			const rzp = new window.Razorpay(options);
			rzp.on("payment.failed", (error) => {
				console.error("Payment failed:", error);
			});
			rzp.open();
		},
		[isReady],
	);

	return { isReady, hasError, openCheckout };
}
