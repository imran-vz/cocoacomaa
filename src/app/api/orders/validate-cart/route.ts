import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { desserts, postalCombos } from "@/lib/db/schema";

interface CartItemToValidate {
	id: number;
	name: string;
	price: number;
	quantity: number;
	type: "postal-brownies" | "cake-orders";
	category?: "cake" | "dessert" | "special";
}

interface ValidationIssue {
	itemId: number;
	itemName: string;
	type: "unavailable" | "price_changed" | "not_found";
	message: string;
	/** Current price from DB (only set when type === "price_changed") */
	currentPrice?: number;
	/** Price the client sent (only set when type === "price_changed") */
	cartPrice?: number;
}

/**
 * POST /api/orders/validate-cart
 *
 * Validates cart items against current database state before payment.
 * Checks:
 * 1. Items still exist and haven't been deleted
 * 2. Items are still available (status = "available")
 * 3. Prices haven't changed since the item was added to cart
 *
 * Returns:
 * - { valid: true } if everything is fine
 * - { valid: false, issues: [...] } with details about each problem
 *
 * This is called from the client right before initiating payment to catch
 * stale cart issues (items removed, price changes, etc.) early — before
 * the user enters payment details.
 */
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id) {
			return NextResponse.json(
				{ valid: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const { items } = body as { items: CartItemToValidate[] };

		if (!Array.isArray(items) || items.length === 0) {
			return NextResponse.json(
				{ valid: false, error: "Cart is empty" },
				{ status: 400 },
			);
		}

		const issues: ValidationIssue[] = [];

		// Separate items by type
		const dessertItems = items.filter((item) => item.type === "cake-orders");
		const postalItems = items.filter((item) => item.type === "postal-brownies");

		// ─── Validate dessert/cake/special items ────────────────────
		if (dessertItems.length > 0) {
			const dessertIds = dessertItems.map((item) => item.id);

			const dbDesserts = await db.query.desserts.findMany({
				where: and(
					inArray(desserts.id, dessertIds),
					eq(desserts.isDeleted, false),
				),
				columns: {
					id: true,
					name: true,
					price: true,
					status: true,
					category: true,
				},
			});

			const dessertMap = new Map(dbDesserts.map((d) => [d.id, d]));

			for (const cartItem of dessertItems) {
				const dbItem = dessertMap.get(cartItem.id);

				if (!dbItem) {
					issues.push({
						itemId: cartItem.id,
						itemName: cartItem.name,
						type: "not_found",
						message: `"${cartItem.name}" is no longer available and has been removed from our menu.`,
					});
					continue;
				}

				if (dbItem.status !== "available") {
					issues.push({
						itemId: cartItem.id,
						itemName: cartItem.name,
						type: "unavailable",
						message: `"${dbItem.name}" is currently unavailable. Please remove it from your cart.`,
					});
					continue;
				}

				// Check price — compare as numbers to avoid string/float issues
				const dbPrice = Number(dbItem.price);
				const cartPrice = Number(cartItem.price);

				if (Math.abs(dbPrice - cartPrice) > 0.01) {
					issues.push({
						itemId: cartItem.id,
						itemName: cartItem.name,
						type: "price_changed",
						message: `The price of "${dbItem.name}" has changed from ₹${cartPrice} to ₹${dbPrice}. Please update your cart.`,
						currentPrice: dbPrice,
						cartPrice: cartPrice,
					});
				}
			}
		}

		// ─── Validate postal combo items ────────────────────────────
		if (postalItems.length > 0) {
			const postalIds = postalItems.map((item) => item.id);

			const dbPostalCombos = await db.query.postalCombos.findMany({
				where: and(
					inArray(postalCombos.id, postalIds),
					eq(postalCombos.isDeleted, false),
				),
				columns: {
					id: true,
					name: true,
					price: true,
					status: true,
				},
			});

			const postalMap = new Map(dbPostalCombos.map((p) => [p.id, p]));

			for (const cartItem of postalItems) {
				const dbItem = postalMap.get(cartItem.id);

				if (!dbItem) {
					issues.push({
						itemId: cartItem.id,
						itemName: cartItem.name,
						type: "not_found",
						message: `"${cartItem.name}" is no longer available.`,
					});
					continue;
				}

				if (dbItem.status !== "available") {
					issues.push({
						itemId: cartItem.id,
						itemName: cartItem.name,
						type: "unavailable",
						message: `"${dbItem.name}" is currently unavailable. Please remove it from your cart.`,
					});
					continue;
				}

				const dbPrice = Number(dbItem.price);
				const cartPrice = Number(cartItem.price);

				if (Math.abs(dbPrice - cartPrice) > 0.01) {
					issues.push({
						itemId: cartItem.id,
						itemName: cartItem.name,
						type: "price_changed",
						message: `The price of "${dbItem.name}" has changed from ₹${cartPrice} to ₹${dbPrice}. Please update your cart.`,
						currentPrice: dbPrice,
						cartPrice: cartPrice,
					});
				}
			}
		}

		if (issues.length > 0) {
			return NextResponse.json({
				valid: false,
				issues,
			});
		}

		return NextResponse.json({ valid: true });
	} catch (error) {
		console.error("Error validating cart:", error);
		return NextResponse.json(
			{ valid: false, error: "Failed to validate cart items" },
			{ status: 500 },
		);
	}
}
