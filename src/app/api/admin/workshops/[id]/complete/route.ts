import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshops } from "@/lib/db/schema";

export async function PATCH(
	_: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		// Check if user is authenticated and is an admin
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const workshopId = Number.parseInt(id, 10);

		if (Number.isNaN(workshopId)) {
			return NextResponse.json(
				{ error: "Invalid workshop ID" },
				{ status: 400 },
			);
		}

		// Update workshop to mark as completed
		const [updatedWorkshop] = await db
			.update(workshops)
			.set({
				status: "completed",
				updatedAt: new Date(),
			})
			.where(eq(workshops.id, workshopId))
			.returning();

		if (!updatedWorkshop) {
			return NextResponse.json(
				{ error: "Workshop not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			workshop: updatedWorkshop,
		});
	} catch (error) {
		console.error("Error marking workshop as completed:", error);
		return NextResponse.json(
			{ error: "Failed to mark workshop as completed" },
			{ status: 500 },
		);
	}
}
