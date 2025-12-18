import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
	createForbiddenResponse,
	createUnauthorizedResponse,
	requireAuth,
} from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { fetchDesserts } from "@/lib/db/dessert";
import { type Dessert, desserts } from "@/lib/db/schema";
import { apiMutationLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category");

		const availableDesserts = await fetchDesserts(
			category ? [category as Dessert["category"]] : ["dessert", "cake"],
		);

		return NextResponse.json(availableDesserts);
	} catch (error) {
		console.error("Error fetching desserts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch desserts" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		// Check authentication and admin role
		const session = await auth.api.getSession({ headers: await headers() });
		requireAuth(session, ["admin"]);

		// Rate limiting
		const rateLimitResult = await checkRateLimit(
			`dessert-create:${session?.user?.id}`,
			apiMutationLimiter,
		);

		if (!rateLimitResult.success) {
			return NextResponse.json(
				{ error: "Too many requests. Please try again later." },
				{ status: 429 },
			);
		}

		const body = await request.json();
		const {
			name,
			description,
			price,
			imageUrl,
			status,
			category,
			leadTimeDays,
			containsEgg,
		} = body;

		if (!name || !description || !price || !category) {
			return NextResponse.json(
				{ error: "Name, description, price, and category are required" },
				{ status: 400 },
			);
		}

		if (category !== "special" && !leadTimeDays) {
			return NextResponse.json(
				{ error: "Lead time is required for non-special items" },
				{ status: 400 },
			);
		}

		// Note: price received here is already the gross amount (including payment processing fees)
		// calculated by the admin form using calculateGrossAmount()
		const newDessert = await db
			.insert(desserts)
			.values({
				name,
				description,
				price, // Gross amount
				imageUrl,
				status: status || "available",
				category,
				containsEgg: Boolean(containsEgg),
				leadTimeDays: Number(leadTimeDays),
			})
			.returning();

		return NextResponse.json(newDessert[0]);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("Unauthorized")) {
				return createUnauthorizedResponse(error.message);
			}
			if (error.message.includes("Forbidden")) {
				return createForbiddenResponse(error.message);
			}
		}
		console.error("Error creating dessert:", error);
		return NextResponse.json(
			{ error: "Failed to create dessert" },
			{ status: 500 },
		);
	}
}
