import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";

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
		const body = await request.json();
		const {
			name,
			description,
			price,
			imageUrl,
			status,
			category,
			leadTimeDays,
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
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to delete dessert" },
			{ status: 500 },
		);
	}
}
