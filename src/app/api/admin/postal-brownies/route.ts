import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
	try {
		const postalCombos = await db.query.postalCombos.findMany({
			where: (postalCombos, { eq }) => eq(postalCombos.isDeleted, false),
			orderBy: (postalCombos, { desc }) => [desc(postalCombos.createdAt)],
			columns: {
				id: true,
				name: true,
				description: true,
				price: true,
				imageUrl: true,
				createdAt: true,
				items: true,
				status: true,
				containsEgg: true,
			},
		});

		return NextResponse.json({ postalCombos });
	} catch (error) {
		console.error("Error fetching postal brownies:", error);
		return NextResponse.json(
			{ error: "Failed to fetch postal brownies" },
			{ status: 500 },
		);
	}
}
