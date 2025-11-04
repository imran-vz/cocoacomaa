import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
	try {
		const specialsList = await db.query.desserts.findMany({
			where: (desserts, { eq, and }) =>
				and(eq(desserts.category, "special"), eq(desserts.isDeleted, false)),
			orderBy: (desserts, { desc }) => [desc(desserts.createdAt)],
			columns: {
				id: true,
				name: true,
				price: true,
				imageUrl: true,
				status: true,
				createdAt: true,
				containsEgg: true,
			},
		});

		return NextResponse.json({ specials: specialsList });
	} catch (error) {
		console.error("Error fetching specials:", error);
		return NextResponse.json(
			{ error: "Failed to fetch specials" },
			{ status: 500 },
		);
	}
}
