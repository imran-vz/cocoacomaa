import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { postalCombos } from "@/lib/db/schema";

const updatePostalComboSchema = z.object({
	name: z.string().min(2, {
		error: "Name is required",
	}),
	description: z.string().min(10, {
		error: "Description is required",
	}),
	price: z.number().min(0, {
		error: "Price must be positive",
	}),
	imageUrl: z.url().optional(),
	items: z.array(z.string()).min(1, {
		error: "At least one item is required",
	}),
	status: z.enum(["available", "unavailable"]),
	containsEgg: z.boolean().prefault(false),
});

// GET - Fetch single postal combo
export async function GET(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const postalComboId = Number.parseInt(id);

		if (Number.isNaN(postalComboId)) {
			return NextResponse.json(
				{ error: "Invalid postal combo ID" },
				{ status: 400 },
			);
		}

		const postalCombo = await db.query.postalCombos.findFirst({
			where: and(
				eq(postalCombos.id, postalComboId),
				eq(postalCombos.isDeleted, false),
			),
		});

		if (!postalCombo) {
			return NextResponse.json(
				{ error: "Postal combo not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			postalCombo,
		});
	} catch (error) {
		console.error("Error fetching postal combo:", error);
		return NextResponse.json(
			{ error: "Failed to fetch postal combo" },
			{ status: 500 },
		);
	}
}

// PUT - Update postal combo
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const postalComboId = Number.parseInt(id);

		if (Number.isNaN(postalComboId)) {
			return NextResponse.json(
				{ error: "Invalid postal combo ID" },
				{ status: 400 },
			);
		}

		const { success, data, error } = updatePostalComboSchema.safeParse(
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

		const [updatedPostalCombo] = await db
			.update(postalCombos)
			.set({
				name,
				description,
				price: price.toString(),
				imageUrl: imageUrl || null,
				items,
				status,
				containsEgg: Boolean(containsEgg),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(postalCombos.id, postalComboId),
					eq(postalCombos.isDeleted, false),
				),
			)
			.returning();

		if (!updatedPostalCombo) {
			return NextResponse.json(
				{ error: "Postal combo not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			postalCombo: updatedPostalCombo,
		});
	} catch (error) {
		console.error("Error updating postal combo:", error);
		return NextResponse.json(
			{ error: "Failed to update postal combo" },
			{ status: 500 },
		);
	}
}

// DELETE - Delete postal combo
export async function DELETE(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const postalComboId = Number.parseInt(id);

		if (Number.isNaN(postalComboId)) {
			return NextResponse.json(
				{ error: "Invalid postal combo ID" },
				{ status: 400 },
			);
		}

		const [deletedPostalCombo] = await db
			.update(postalCombos)
			.set({ isDeleted: true })
			.where(
				and(
					eq(postalCombos.id, postalComboId),
					eq(postalCombos.isDeleted, false),
				),
			)
			.returning();

		if (!deletedPostalCombo) {
			return NextResponse.json(
				{ error: "Postal combo not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Postal combo deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting postal combo:", error);
		return NextResponse.json(
			{ error: "Failed to delete postal combo" },
			{ status: 500 },
		);
	}
}
