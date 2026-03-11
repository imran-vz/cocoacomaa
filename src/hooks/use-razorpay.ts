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

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const MAX_LOAD_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1500;

interface UseRazorpayReturn {
	/** Whether the Razorpay script is loaded and ready */
	isReady: boolean;
	/** Whether the script failed to load after all retries */
	hasError: boolean;
	/** Whether the script is currently loading or retrying */
	isLoading: boolean;
	/** How many load attempts have been made */
	loadAttempt: number;
	/** Human-readable error message when hasError is true */
	errorMessage: string | null;
	/** Manually retry loading the script (e.g. from a "Try Again" button) */
	retryLoad: () => void;
	/** Open the Razorpay checkout modal */
	openCheckout: (options: RazorpayOptions) => void;
}

/**
 * Hook for loading and interacting with the Razorpay checkout.
 *
 * Handles:
 * - Script loading with automatic retry (exponential backoff, up to 3 attempts)
 * - Cleanup on unmount
 * - Manual retry via `retryLoad()` for user-triggered recovery
 * - User-friendly error messages for script load failures
 * - Graceful handling when `openCheckout` is called before script is ready
 */
export function useRazorpay(): UseRazorpayReturn {
	const [isReady, setIsReady] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [loadAttempt, setLoadAttempt] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const scriptRef = useRef<HTMLScriptElement | null>(null);
	const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isMountedRef = useRef(true);
	const attemptRef = useRef(0);

	// Use a ref for the load function so handleLoadFailure can call it
	// without creating a circular useCallback dependency.
	const loadScriptRef = useRef<() => void>(() => {});

	const cleanup = useCallback(() => {
		if (retryTimeoutRef.current) {
			clearTimeout(retryTimeoutRef.current);
			retryTimeoutRef.current = null;
		}
	}, []);

	const removeScript = useCallback(() => {
		if (scriptRef.current && document.body.contains(scriptRef.current)) {
			document.body.removeChild(scriptRef.current);
			scriptRef.current = null;
		}
	}, []);

	const handleLoadFailure = useCallback(() => {
		if (!isMountedRef.current) return;

		attemptRef.current += 1;
		const nextAttempt = attemptRef.current;

		if (nextAttempt < MAX_LOAD_RETRIES) {
			// Remove the failed script element so we can try a fresh one
			removeScript();

			// Exponential backoff: 1500ms, 3000ms
			const delay = BASE_RETRY_DELAY_MS * 2 ** (nextAttempt - 1);
			setLoadAttempt(nextAttempt);
			setErrorMessage(
				`Payment gateway loading failed. Retrying (${nextAttempt}/${MAX_LOAD_RETRIES})...`,
			);

			retryTimeoutRef.current = setTimeout(() => {
				if (isMountedRef.current) {
					loadScriptRef.current();
				}
			}, delay);
		} else {
			// All retries exhausted
			setIsLoading(false);
			setHasError(true);
			setErrorMessage(
				"Unable to load the payment gateway. Please check your internet connection and try again, or use a different browser.",
			);
			setLoadAttempt(nextAttempt);
		}
	}, [removeScript]);

	const loadScript = useCallback(() => {
		if (!isMountedRef.current) return;

		// Already loaded globally
		if (window.Razorpay) {
			setIsReady(true);
			setIsLoading(false);
			setHasError(false);
			setErrorMessage(null);
			return;
		}

		// Remove any prior failed script element before re-attempting
		removeScript();

		setIsLoading(true);
		setHasError(false);
		setErrorMessage(null);

		const currentAttempt = attemptRef.current;
		setLoadAttempt(currentAttempt + 1);

		// Check for an existing script tag injected by another hook instance
		const existingScript = document.querySelector(
			`script[src="${RAZORPAY_SCRIPT_URL}"]`,
		) as HTMLScriptElement | null;

		if (existingScript) {
			// Script tag exists but may not have finished loading yet
			const onExistingLoad = () => {
				if (!isMountedRef.current) return;
				setIsReady(true);
				setIsLoading(false);
				setHasError(false);
				setErrorMessage(null);
			};
			const onExistingError = () => {
				if (!isMountedRef.current) return;
				handleLoadFailure();
			};

			// If already loaded
			if (window.Razorpay) {
				onExistingLoad();
				return;
			}

			existingScript.addEventListener("load", onExistingLoad, { once: true });
			existingScript.addEventListener("error", onExistingError, { once: true });
			return;
		}

		const script = document.createElement("script");
		script.src = RAZORPAY_SCRIPT_URL;
		script.async = true;

		script.onload = () => {
			if (!isMountedRef.current) return;
			attemptRef.current = 0;
			setIsReady(true);
			setIsLoading(false);
			setHasError(false);
			setErrorMessage(null);
			setLoadAttempt(1);
		};

		script.onerror = () => {
			if (!isMountedRef.current) return;
			handleLoadFailure();
		};

		document.body.appendChild(script);
		scriptRef.current = script;
	}, [removeScript, handleLoadFailure]);

	// Keep the ref in sync so handleLoadFailure can always call the latest version
	loadScriptRef.current = loadScript;

	// Manual retry exposed to the consumer
	const retryLoad = useCallback(() => {
		cleanup();
		attemptRef.current = 0;
		setHasError(false);
		setErrorMessage(null);
		setIsReady(false);
		loadScript();
	}, [loadScript, cleanup]);

	useEffect(() => {
		isMountedRef.current = true;
		loadScript();

		return () => {
			isMountedRef.current = false;
			cleanup();
			removeScript();
		};
	}, [loadScript, cleanup, removeScript]);

	const openCheckout = useCallback(
		(options: RazorpayOptions) => {
			if (!isReady || !window.Razorpay) {
				const msg = hasError
					? "Payment gateway failed to load. Please refresh the page and try again."
					: "Payment gateway is still loading. Please wait a moment and try again.";
				console.error("Razorpay not available:", msg);
				// Surface via the options modal dismiss so callers can handle it
				options.modal?.ondismiss?.();
				return;
			}

			const rzp = new window.Razorpay(options);
			rzp.on("payment.failed", (error) => {
				console.error("Razorpay payment failed:", error);
			});
			rzp.open();
		},
		[isReady, hasError],
	);

	return {
		isReady,
		hasError,
		isLoading,
		loadAttempt,
		errorMessage,
		retryLoad,
		openCheckout,
	};
}
