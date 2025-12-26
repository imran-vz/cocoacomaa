import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addresses } from "@/lib/db/schema";

const createAddressSchema = z.object({
	addressLine1: z.string().min(2, {
		error: "Address line 1 is required",
	}),
	addressLine2: z.string().optional(),
	city: z.string().min(2, {
		error: "City is required",
	}),
	state: z.string().min(2, {
		error: "State is required",
	}),
	zip: z.string().min(5, {
		error: "ZIP code must be at least 5 characters",
	}),
});

// GET - Fetch user's addresses
export async function GET() {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userAddresses = await db.query.addresses.findMany({
			where: and(
				eq(addresses.userId, session.user.id),
				eq(addresses.isDeleted, false),
			),
			orderBy: (addresses, { desc }) => [desc(addresses.createdAt)],
		});

		return NextResponse.json({
			success: true,
			addresses: userAddresses,
		});
	} catch (error) {
		console.error("Error fetching addresses:", error);
		return NextResponse.json(
			{ error: "Failed to fetch addresses" },
			{ status: 500 },
		);
	}
}

// POST - Create new address
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { success, data, error } = createAddressSchema.safeParse(
			await request.json(),
		);

		if (!success) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const { addressLine1, addressLine2, city, state, zip } = data;

		const [newAddress] = await db
			.insert(addresses)
			.values({
				userId: session.user.id,
				addressLine1,
				addressLine2: addressLine2 || null,
				city,
				state,
				zip,
			})
			.returning();

		return NextResponse.json({
			success: true,
			address: newAddress,
		});
	} catch (error) {
		console.error("Error creating address:", error);
		return NextResponse.json(
			{ error: "Failed to create address" },
			{ status: 500 },
		);
	}
}
