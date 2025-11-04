import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { desserts } from "@/lib/db/schema";

export async function GET() {
	try {
		const dessertsList = await db.query.desserts.findMany({
			orderBy: (desserts, { desc }) => [desc(desserts.createdAt)],
			columns: {
				id: true,
				name: true,
				price: true,
				imageUrl: true,
				category: true,
				leadTimeDays: true,
				status: true,
				createdAt: true,
				containsEgg: true,
			},
			where: and(
				inArray(desserts.category, ["dessert", "cake"]),
				eq(desserts.isDeleted, false),
			),
		});

		return NextResponse.json({ desserts: dessertsList });
	} catch (error) {
		console.error("Error fetching desserts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch desserts" },
			{ status: 500 },
		);
	}
}
