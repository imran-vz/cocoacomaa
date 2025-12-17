import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
	createForbiddenResponse,
	createUnauthorizedResponse,
	requireAuth,
} from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";
import { apiMutationLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function GET(
	_: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const dessert = await db
			.select()
			.from(desserts)
			.where(
				and(
					eq(desserts.id, Number.parseInt((await params).id, 10)),
					eq(desserts.isDeleted, false),
				),
			)
			.limit(1);

		if (!dessert.length) {
			return NextResponse.json({ error: "Dessert not found" }, { status: 404 });
		}

		return NextResponse.json(dessert[0]);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to fetch dessert" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		// Check authentication and admin role
		const session = await auth();
		requireAuth(session, ["admin"]);

		// Rate limiting
		const rateLimitResult = await checkRateLimit(
			`dessert-update:${session?.user?.id}`,
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

		// Note: price received here is already the gross amount (including payment processing fees)
		// calculated by the admin form using calculateGrossAmount()
		const updatedDessert = await db
			.update(desserts)
			.set({
				name,
				description,
				price, // Gross amount
				imageUrl,
				status,
				category,
				containsEgg: Boolean(containsEgg),
				leadTimeDays: Number(leadTimeDays),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(desserts.id, Number.parseInt((await params).id, 10)),
					eq(desserts.isDeleted, false),
				),
			)
			.returning();

		if (!updatedDessert.length) {
			return NextResponse.json({ error: "Dessert not found" }, { status: 404 });
		}

		return NextResponse.json(updatedDessert[0]);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("Unauthorized")) {
				return createUnauthorizedResponse(error.message);
			}
			if (error.message.includes("Forbidden")) {
				return createForbiddenResponse(error.message);
			}
		}
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to update dessert" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		// Check authentication and admin role
		const session = await auth();
		requireAuth(session, ["admin"]);

		// Rate limiting
		const rateLimitResult = await checkRateLimit(
			`dessert-delete:${session?.user?.id}`,
			apiMutationLimiter,
		);

		if (!rateLimitResult.success) {
			return NextResponse.json(
				{ error: "Too many requests. Please try again later." },
				{ status: 429 },
			);
		}

		const deletedDessert = await db
			.update(desserts)
			.set({ isDeleted: true, updatedAt: new Date() })
			.where(eq(desserts.id, Number.parseInt((await params).id, 10)))
			.returning();

		if (!deletedDessert.length) {
			return NextResponse.json({ error: "Dessert not found" }, { status: 404 });
		}

		return NextResponse.json(deletedDessert[0]);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("Unauthorized")) {
				return createUnauthorizedResponse(error.message);
			}
			if (error.message.includes("Forbidden")) {
				return createForbiddenResponse(error.message);
			}
		}
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to delete dessert" },
			{ status: 500 },
		);
	}
}
