import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postalCombos } from "@/lib/db/schema";

export async function GET() {
	try {
		const availableCombos = await db
			.select()
			.from(postalCombos)
			.where(eq(postalCombos.status, "available"))
			.orderBy(postalCombos.price);

		return NextResponse.json(availableCombos);
	} catch (error) {
		console.error("Error fetching postal combos:", error);
		return NextResponse.json(
			{ error: "Failed to fetch postal combos" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { name, description, price, imageUrl, comboType, items, status } =
			body;

		if (!name || !description || !price || !comboType || !items) {
			return NextResponse.json(
				{
					error: "Name, description, price, comboType, and items are required",
				},
				{ status: 400 },
			);
		}

		const newCombo = await db
			.insert(postalCombos)
			.values({
				name,
				description,
				price,
				imageUrl,
				comboType,
				items,
				status: status || "available",
			})
			.returning();

		return NextResponse.json(newCombo[0]);
	} catch (error) {
		console.error("Error creating postal combo:", error);
		return NextResponse.json(
			{ error: "Failed to create postal combo" },
			{ status: 500 },
		);
	}
}
