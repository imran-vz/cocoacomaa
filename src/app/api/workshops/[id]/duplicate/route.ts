import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshops } from "@/lib/db/schema";

export async function POST(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id || session.user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { id } = await params;

		// Fetch the original workshop
		const originalWorkshop = await db.query.workshops.findFirst({
			where: eq(workshops.id, parseInt(id)),
		});

		if (!originalWorkshop) {
			return NextResponse.json(
				{ success: false, message: "Workshop not found" },
				{ status: 404 },
			);
		}

		// Create a duplicate with status set to "inactive"
		const [duplicateWorkshop] = await db
			.insert(workshops)
			.values({
				title: `${originalWorkshop.title} (Copy)`,
				description: originalWorkshop.description,
				amount: originalWorkshop.amount,
				type: originalWorkshop.type,
				maxBookings: originalWorkshop.maxBookings,
				imageUrl: originalWorkshop.imageUrl,
				status: "inactive",
			})
			.returning();

		if (!duplicateWorkshop) {
			return NextResponse.json(
				{ success: false, message: "Failed to duplicate workshop" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			data: duplicateWorkshop,
		});
	} catch (error) {
		console.error("Error duplicating workshop:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to duplicate workshop" },
			{ status: 500 },
		);
	}
}
