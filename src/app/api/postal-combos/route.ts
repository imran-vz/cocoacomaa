import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { postalCombos } from "@/lib/db/schema";

const createPostalComboSchema = z.object({
	name: z.string().min(2, { message: "Name is required" }),
	description: z.string().min(10, { message: "Description is required" }),
	price: z.number().min(0, { message: "Price must be positive" }),
	imageUrl: z.string().url().optional(),
	items: z
		.array(z.string())
		.min(1, { message: "At least one item is required" }),
	status: z.enum(["available", "unavailable"]).default("available"),
	containsEgg: z.boolean().default(false),
});

// GET - Fetch all postal combos
export async function GET() {
	try {
		const allPostalCombos = await db.query.postalCombos.findMany({
			orderBy: (postalCombos, { asc }) => [asc(postalCombos.createdAt)],
			where: and(
				eq(postalCombos.isDeleted, false),
				eq(postalCombos.status, "available"),
			),
		});

		return NextResponse.json({
			success: true,
			data: allPostalCombos,
		});
	} catch (error) {
		console.error("Error fetching postal combos:", error);
		return NextResponse.json(
			{ error: "Failed to fetch postal combos", success: false },
			{ status: 500 },
		);
	}
}

// POST - Create new postal combo
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { success, data, error } = createPostalComboSchema.safeParse(
			await request.json(),
		);

		if (!success) {
			return NextResponse.json(
				{ error: error.errors[0].message },
				{ status: 400 },
			);
		}

		const { name, description, price, imageUrl, items, status, containsEgg } =
			data;

		await db.insert(postalCombos).values({
			name,
			description,
			price: price.toString(),
			imageUrl: imageUrl || null,
			items,
			status,
			containsEgg: Boolean(containsEgg),
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error creating postal combo:", error);
		return NextResponse.json(
			{ error: "Failed to create postal combo" },
			{ status: 500 },
		);
	}
}
