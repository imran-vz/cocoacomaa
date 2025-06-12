import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
	try {
		const availableDesserts = await db
			.select()
			.from(desserts)
			.where(eq(desserts.enabled, true));

		return NextResponse.json(availableDesserts);
	} catch (error) {
		console.error("Error fetching desserts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch desserts" },
			{ status: 500 },
		);
	}
}
