import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ userId: string }> },
) {
	try {
		const session = await auth();

		// Check if user is admin or manager
		if (
			!session?.user ||
			(session.user.role !== "admin" && session.user.role !== "manager")
		) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { phoneVerified } = await request.json();
		const { userId } = await params;

		// Update user's phone verification status
		await db
			.update(users)
			.set({
				phoneVerified,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating phone verification:", error);
		return NextResponse.json(
			{ error: "Failed to update phone verification status" },
			{ status: 500 },
		);
	}
}
