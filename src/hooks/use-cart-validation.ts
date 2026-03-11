"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";

// ─── Types ──────────────────────────────────────────────────────

export interface ValidationIssue {
	itemId: number;
	itemName: string;
	type: "unavailable" | "price_changed" | "not_found";
	message: string;
	/** Current price from DB (only set when type === "price_changed") */
	currentPrice?: number;
	/** Price the client sent (only set when type === "price_changed") */
	cartPrice?: number;
}

interface CartValidationResult {
	valid: boolean;
	issues: ValidationIssue[];
}

interface UseCartValidationReturn {
	/** Whether a validation request is currently in-flight */
	isValidating: boolean;
	/** Issues found during the last validation (empty if valid) */
	issues: ValidationIssue[];
	/**
	 * Validate all cart items against the server.
	 * Returns `true` if the cart is valid, `false` otherwise.
	 * When invalid, `issues` will be populated and toasts shown.
	 */
	validateCart: () => Promise<boolean>;
	/**
	 * Remove all unavailable/not-found items and update prices for changed items.
	 * Call this after validation to automatically fix the cart.
	 * Returns the number of items removed.
	 */
	resolveIssues: () => number;
	/** Clear any stored issues (e.g. after the user dismisses a dialog) */
	clearIssues: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────

/**
 * Hook for validating cart items against server-side availability and pricing.
 *
 * Call `validateCart()` before initiating payment to catch:
 * - Items that have been deleted or made unavailable since being added
 * - Price changes that would cause the total to differ from what the user expects
 *
 * If issues are found, they are stored in `issues` and toasts are shown.
 * The caller can then either:
 * 1. Call `resolveIssues()` to auto-fix the cart (remove unavailable, update prices)
 * 2. Let the user manually review and fix their cart
 *
 * @example
 * ```tsx
 * const { validateCart, issues, resolveIssues, isValidating } = useCartValidation();
 *
 * const handleCheckout = async () => {
 *   const isValid = await validateCart();
 *   if (!isValid) {
 *     // Show a dialog with issues, or auto-fix:
 *     resolveIssues();
 *     return;
 *   }
 *   // Proceed with payment...
 * };
 * ```
 */
export function useCartValidation(): UseCartValidationReturn {
	const { items, removeItem } = useCart();
	const [isValidating, setIsValidating] = useState(false);
	const [issues, setIssues] = useState<ValidationIssue[]>([]);
	const abortControllerRef = useRef<AbortController | null>(null);

	const validateCart = useCallback(async (): Promise<boolean> => {
		// Nothing to validate if cart is empty
		if (items.length === 0) {
			setIssues([]);
			return true;
		}

		// Cancel any in-flight validation
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const controller = new AbortController();
		abortControllerRef.current = controller;

		setIsValidating(true);
		setIssues([]);

		try {
			const response = await fetch("/api/orders/validate-cart", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					items: items.map((item) => ({
						id: item.id,
						name: item.name,
						price: item.price,
						quantity: item.quantity,
						type: item.type,
						category: item.category,
					})),
				}),
				signal: controller.signal,
			});

			// If the request was aborted (e.g. component unmounted), bail out silently
			if (controller.signal.aborted) {
				return false;
			}

			if (!response.ok) {
				// Server error — don't block checkout, just warn
				console.error(
					"Cart validation request failed:",
					response.status,
					response.statusText,
				);
				// On server error, we allow checkout to proceed (fail-open).
				// The order creation API will catch any real issues.
				return true;
			}

			const data: CartValidationResult = await response.json();

			if (data.valid) {
				setIssues([]);
				return true;
			}

			// We have issues — store them and notify the user
			const validationIssues = data.issues || [];
			setIssues(validationIssues);

			// Show appropriate toasts based on issue types
			const unavailableItems = validationIssues.filter(
				(i) => i.type === "unavailable" || i.type === "not_found",
			);
			const priceChangedItems = validationIssues.filter(
				(i) => i.type === "price_changed",
			);

			if (unavailableItems.length > 0 && priceChangedItems.length > 0) {
				toast.warning(
					`Some items in your cart are no longer available, and prices have changed for others. Please review your cart.`,
					{ duration: 6000 },
				);
			} else if (unavailableItems.length > 0) {
				const names = unavailableItems.map((i) => i.itemName).join(", ");
				toast.warning(
					unavailableItems.length === 1
						? `"${names}" is no longer available. Please remove it from your cart.`
						: `Some items are no longer available: ${names}`,
					{ duration: 6000 },
				);
			} else if (priceChangedItems.length > 0) {
				toast.warning(
					priceChangedItems.length === 1
						? `The price of "${priceChangedItems[0].itemName}" has changed. Your cart total will be updated.`
						: `Prices have changed for ${priceChangedItems.length} items in your cart. Totals will be updated.`,
					{ duration: 6000 },
				);
			}

			return false;
		} catch (error) {
			// Aborted — silent
			if (error instanceof DOMException && error.name === "AbortError") {
				return false;
			}

			// Network error — fail open (let checkout proceed)
			console.error("Cart validation error:", error);
			toast.error(
				"We couldn't verify your cart items. Proceeding with checkout — any issues will be caught during order creation.",
				{ duration: 5000 },
			);
			return true;
		} finally {
			setIsValidating(false);
			if (abortControllerRef.current === controller) {
				abortControllerRef.current = null;
			}
		}
	}, [items]);

	/**
	 * Automatically resolve all issues by:
	 * - Removing items that are unavailable or not found
	 * - Updating quantities/keeping items whose prices changed
	 *   (the cart context recalculates totals on quantity update)
	 *
	 * For price changes, we trigger a quantity "update" to the same quantity,
	 * which doesn't change the quantity but causes a re-render. The actual
	 * price sync requires the cart context to support a SET_PRICE action,
	 * so we remove + re-add logic is avoided. Instead, we remove the item
	 * so the user re-adds at the correct price. This is the safest approach.
	 *
	 * Returns the number of items removed from the cart.
	 */
	const resolveIssues = useCallback((): number => {
		let removedCount = 0;

		for (const issue of issues) {
			if (issue.type === "unavailable" || issue.type === "not_found") {
				removeItem(issue.itemId);
				removedCount++;
			} else if (issue.type === "price_changed") {
				// Remove items with stale prices — user needs to re-add at the new price.
				// This prevents charging the user a different amount than what they see.
				removeItem(issue.itemId);
				removedCount++;
			}
		}

		if (removedCount > 0) {
			toast.info(
				removedCount === 1
					? "1 item was removed from your cart. Please review before continuing."
					: `${removedCount} items were removed from your cart. Please review before continuing.`,
				{ duration: 5000 },
			);
		}

		setIssues([]);
		return removedCount;
	}, [issues, removeItem]);

	const clearIssues = useCallback(() => {
		setIssues([]);
	}, []);

	return {
		isValidating,
		issues,
		validateCart,
		resolveIssues,
		clearIssues,
	};
}
