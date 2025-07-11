import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { workshops } from "@/lib/db/schema";

export async function GET() {
	try {
		const workshopsList = await db.query.workshops.findMany({
			where: eq(workshops.isDeleted, false),
			orderBy: [desc(workshops.createdAt)],
		});

		return NextResponse.json({
			success: true,
			data: workshopsList,
		});
	} catch (error) {
		console.error("Error fetching workshops:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch workshops" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id || session.user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const { title, description, amount, type, imageUrl } = body;

		if (!title || !description || !amount || !type) {
			return NextResponse.json(
				{ success: false, message: "Missing required fields" },
				{ status: 400 },
			);
		}

		if (!["online", "offline"].includes(type)) {
			return NextResponse.json(
				{ success: false, message: "Invalid workshop type" },
				{ status: 400 },
			);
		}

		const [workshop] = await db
			.insert(workshops)
			.values({
				title,
				description,
				amount: amount.toString(),
				type,
				imageUrl,
			})
			.returning();

		return NextResponse.json({
			success: true,
			data: workshop,
		});
	} catch (error) {
		console.error("Error creating workshop:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to create workshop" },
			{ status: 500 },
		);
	}
}
