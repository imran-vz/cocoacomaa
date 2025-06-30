import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { resetPasswordSchema } from "@/lib/schema";

export async function POST(request: Request) {
	try {
		const { success, data, error } = resetPasswordSchema.safeParse(
			await request.json(),
		);

		if (!success) {
			return NextResponse.json(
				{
					message: "Invalid input data.",
					errors: error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const { token, email, password } = data;

		// Find valid token
		const resetToken = await db.query.passwordResetTokens.findFirst({
			where: and(
				eq(passwordResetTokens.email, email),
				eq(passwordResetTokens.token, token),
				eq(passwordResetTokens.used, false),
			),
		});

		if (!resetToken) {
			return NextResponse.json(
				{ message: "Invalid or expired OTP." },
				{ status: 400 },
			);
		}

		// Check if token is expired
		if (new Date() > resetToken.expiresAt) {
			return NextResponse.json(
				{ message: "OTP has expired. Please request a new one." },
				{ status: 400 },
			);
		}

		// Find user
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		if (!user) {
			return NextResponse.json({ message: "User not found." }, { status: 404 });
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Update user password
		await db
			.update(users)
			.set({
				password: hashedPassword,
				updatedAt: new Date(),
			})
			.where(eq(users.email, email));

		// Mark token as used
		await db
			.update(passwordResetTokens)
			.set({ used: true })
			.where(eq(passwordResetTokens.id, resetToken.id));

		return NextResponse.json(
			{ message: "Password reset successfully." },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Reset password error:", error);
		return NextResponse.json(
			{ message: "Something went wrong. Please try again." },
			{ status: 500 },
		);
	}
}
