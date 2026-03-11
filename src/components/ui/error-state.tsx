"use client";

import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
	/** Main error title */
	title?: string;
	/** Descriptive message explaining what went wrong */
	message?: string;
	/** Whether this is a network/connectivity error */
	isNetworkError?: boolean;
	/** Callback to retry the failed operation */
	onRetry?: () => void;
	/** Label for the retry button */
	retryLabel?: string;
	/** Whether a retry is currently in progress */
	isRetrying?: boolean;
	/** Additional action (e.g. "Go Home" button) */
	action?: {
		label: string;
		onClick: () => void;
		variant?: "default" | "outline" | "ghost" | "secondary";
	};
	/** Size variant */
	size?: "sm" | "md" | "lg";
	/** Additional class names */
	className?: string;
}

/**
 * Reusable inline error state component.
 * Shows a friendly error message with optional retry button and custom action.
 * Use this for data-fetch failures, empty error results, and general error displays
 * within page content (as opposed to toast notifications for transient errors).
 */
export function ErrorState({
	title,
	message,
	isNetworkError = false,
	onRetry,
	retryLabel = "Try Again",
	isRetrying = false,
	action,
	size = "md",
	className,
}: ErrorStateProps) {
	const Icon = isNetworkError ? WifiOff : AlertCircle;

	const resolvedTitle =
		title ?? (isNetworkError ? "Connection Problem" : "Something went wrong");

	const resolvedMessage =
		message ??
		(isNetworkError
			? "Please check your internet connection and try again."
			: "We couldn't complete your request. Please try again in a moment.");

	const iconSize = {
		sm: "h-8 w-8",
		md: "h-10 w-10",
		lg: "h-12 w-12",
	}[size];

	const titleSize = {
		sm: "text-sm",
		md: "text-base",
		lg: "text-lg",
	}[size];

	const messageSize = {
		sm: "text-xs",
		md: "text-sm",
		lg: "text-sm",
	}[size];

	const padding = {
		sm: "py-6 px-4",
		md: "py-8 px-6",
		lg: "py-12 px-8",
	}[size];

	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center text-center rounded-lg border border-dashed",
				padding,
				className,
			)}
			role="alert"
		>
			<div
				className={cn(
					"mb-3 flex items-center justify-center rounded-full bg-destructive/10 p-2.5",
					size === "sm" && "p-2",
				)}
			>
				<Icon
					className={cn(iconSize, "text-destructive/70")}
					aria-hidden="true"
				/>
			</div>

			<h3
				className={cn(
					"font-semibold tracking-tight text-foreground",
					titleSize,
				)}
			>
				{resolvedTitle}
			</h3>

			<p
				className={cn(
					"mt-1.5 max-w-sm text-muted-foreground leading-relaxed",
					messageSize,
				)}
			>
				{resolvedMessage}
			</p>

			{(onRetry || action) && (
				<div className="mt-4 flex items-center gap-3">
					{onRetry && (
						<Button
							variant="outline"
							size={size === "lg" ? "default" : "sm"}
							onClick={onRetry}
							disabled={isRetrying}
							className="gap-1.5"
						>
							<RefreshCw
								className={cn("h-3.5 w-3.5", isRetrying && "animate-spin")}
							/>
							{isRetrying ? "Retrying..." : retryLabel}
						</Button>
					)}
					{action && (
						<Button
							variant={action.variant ?? "ghost"}
							size={size === "lg" ? "default" : "sm"}
							onClick={action.onClick}
						>
							{action.label}
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

// ─── Friendly error message helpers ─────────────────────────────

/** Map common fetch/API errors to user-friendly messages */
export function getUserFriendlyErrorMessage(error: unknown): {
	title: string;
	message: string;
	isNetworkError: boolean;
} {
	// Network errors
	if (error instanceof TypeError && error.message === "Failed to fetch") {
		return {
			title: "Connection Problem",
			message:
				"We couldn't reach our servers. Please check your internet connection and try again.",
			isNetworkError: true,
		};
	}

	// Axios network errors
	if (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code: string }).code === "ERR_NETWORK"
	) {
		return {
			title: "Connection Problem",
			message:
				"We couldn't reach our servers. Please check your internet connection and try again.",
			isNetworkError: true,
		};
	}

	// Timeout errors
	if (error instanceof DOMException && error.name === "AbortError") {
		return {
			title: "Request Timed Out",
			message: "The request took too long to complete. Please try again.",
			isNetworkError: false,
		};
	}

	// HTTP status-based errors
	if (typeof error === "object" && error !== null && "response" in error) {
		const response = (error as { response: { status: number } }).response;
		const status = response?.status;

		if (status === 401 || status === 403) {
			return {
				title: "Access Denied",
				message:
					"You don't have permission to perform this action. Please log in and try again.",
				isNetworkError: false,
			};
		}

		if (status === 404) {
			return {
				title: "Not Found",
				message:
					"The item you're looking for doesn't exist or has been removed.",
				isNetworkError: false,
			};
		}

		if (status === 429) {
			return {
				title: "Too Many Requests",
				message:
					"You're making requests too quickly. Please wait a moment and try again.",
				isNetworkError: false,
			};
		}

		if (status && status >= 500) {
			return {
				title: "Server Error",
				message:
					"Something went wrong on our end. Our team has been notified. Please try again in a few minutes.",
				isNetworkError: false,
			};
		}
	}

	// Generic error with message
	if (error instanceof Error && error.message) {
		return {
			title: "Something Went Wrong",
			message: error.message,
			isNetworkError: false,
		};
	}

	// Fallback
	return {
		title: "Something Went Wrong",
		message: "We couldn't complete your request. Please try again in a moment.",
		isNetworkError: false,
	};
}

/**
 * Get a user-friendly toast message for common error scenarios.
 * Use this when showing toast.error() to replace generic "Something went wrong" messages.
 */
export function getToastErrorMessage(error: unknown, context?: string): string {
	const { message, isNetworkError } = getUserFriendlyErrorMessage(error);

	if (isNetworkError) {
		return "Connection problem — please check your internet and try again.";
	}

	if (context) {
		// Provide context-specific messages
		const contextMessages: Record<string, string> = {
			"load-desserts":
				"Couldn't load desserts. Pull down to refresh or try again later.",
			"load-specials":
				"Couldn't load specials. Pull down to refresh or try again later.",
			"load-workshops":
				"Couldn't load workshops. Pull down to refresh or try again later.",
			"load-combos":
				"Couldn't load brownie combos. Pull down to refresh or try again later.",
			"create-order":
				"Couldn't create your order. Please check your details and try again.",
			"verify-payment":
				"Payment verification failed. If money was deducted, it will be refunded automatically. Please contact support if the issue persists.",
			"update-phone": "Couldn't update your phone number. Please try again.",
			"create-address":
				"Couldn't save your address. Please check the details and try again.",
			"add-to-cart": "Couldn't add item to cart. Please try again.",
			"register-workshop":
				"Couldn't register for the workshop. Please try again.",
			"retry-payment":
				"Couldn't initiate payment. Please try again or contact support.",
		};

		if (contextMessages[context]) {
			return contextMessages[context];
		}
	}

	return message;
}
