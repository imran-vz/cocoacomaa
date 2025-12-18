import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { SECURITY_CONFIG } from "@/lib/security-config";

const resetPasswordSchema = z.object({
	newPassword: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			"Password must contain at least one lowercase letter, one uppercase letter, and one number",
		),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const validatedData = resetPasswordSchema.parse(body);

		// Check if manager exists and is actually a manager
		const existingManager = await db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);

		if (existingManager.length === 0) {
			return NextResponse.json({ error: "Manager not found" }, { status: 404 });
		}

		if (existingManager[0].role !== "manager") {
			return NextResponse.json(
				{ error: "User is not a manager" },
				{ status: 400 },
			);
		}

		// Hash new password with secure bcrypt rounds
		const hashedPassword = await bcrypt.hash(
			validatedData.newPassword,
			SECURITY_CONFIG.bcryptRounds,
		);

		// Update manager password
		const [updatedManager] = await db
			.update(users)
			.set({
				password: hashedPassword,
				updatedAt: new Date(),
			})
			.where(eq(users.id, id))
			.returning({
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role,
			});

		return NextResponse.json({
			message: "Password reset successfully",
			manager: updatedManager,
		});
	} catch (error) {
		console.error("Error resetting manager password:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid data", details: error.errors },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to reset password" },
			{ status: 500 },
		);
	}
}
