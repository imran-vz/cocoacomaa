import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";

export async function GET() {
	try {
		const availableDesserts = await db
			.select()
			.from(desserts)
			.where(eq(desserts.status, "available"));

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
		const { name, description, price, imageUrl, status } = body;

		if (!name || !description || !price) {
			return NextResponse.json(
				{ error: "Name, description, and price are required" },
				{ status: 400 },
			);
		}

		const newDessert = await db
			.insert(desserts)
			.values({
				name,
				description,
				price,
				imageUrl,
				status: status || "available",
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
