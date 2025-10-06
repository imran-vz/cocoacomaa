import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category");

		const whereConditions = [
			eq(desserts.status, "available"),
			eq(desserts.isDeleted, false),
		];

		if (category) {
			whereConditions.push(
				eq(desserts.category, category as "cake" | "dessert" | "special"),
			);
		}

		const availableDesserts = await db
			.select()
			.from(desserts)
			.where(and(...whereConditions))
			.orderBy(asc(desserts.price));

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
				leadTimeDays: Number(leadTimeDays),
			})
			.returning();

		return NextResponse.json(newDessert[0]);
	} catch (error) {
		console.error("Error creating dessert:", error);
		return NextResponse.json(
			{ error: "Failed to create dessert" },
			{ status: 500 },
		);
	}
}
