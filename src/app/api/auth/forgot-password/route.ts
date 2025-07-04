import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { forgotPasswordSchema } from "@/lib/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	try {
		const { success, data, error } = forgotPasswordSchema.safeParse(
			await request.json(),
		);

		if (!success) {
			return NextResponse.json(
				{
					message: "Invalid email address.",
					errors: error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const { email } = data;

		// Check if user exists
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		if (!user) {
			// Don't reveal if email exists for security
			return NextResponse.json(
				{ message: "If this email exists, an OTP will be sent." },
				{ status: 200 },
			);
		}

		// Rate limiting: Check if an OTP was sent in the last 2 hours
		const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
		const recentToken = await db.query.passwordResetTokens.findFirst({
			where: and(
				eq(passwordResetTokens.email, email),
				// Check if created within last 2 hours
				sql`${passwordResetTokens.createdAt} > ${twoHoursAgo.toISOString()}`,
			),
			orderBy: (passwordResetTokens, { desc }) => [
				desc(passwordResetTokens.createdAt),
			],
		});

		if (recentToken) {
			const timeLeft = Math.ceil(
				(recentToken.createdAt.getTime() + 2 * 60 * 60 * 1000 - Date.now()) /
					(60 * 1000),
			);
			return NextResponse.json(
				{
					message: `Please wait ${timeLeft} minutes before requesting another OTP.`,
				},
				{ status: 429 },
			);
		}

		// Generate 6-digit OTP
		const token = Math.floor(100000 + Math.random() * 900000).toString();
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

		// Delete only expired or used tokens for this email (keep recent ones for rate limiting)
		await db
			.delete(passwordResetTokens)
			.where(
				and(
					eq(passwordResetTokens.email, email),
					sql`(${passwordResetTokens.expiresAt} < NOW() OR ${passwordResetTokens.used} = true)`,
				),
			);

		// Store the OTP token
		await db.insert(passwordResetTokens).values({
			email,
			token,
			expiresAt,
		});

		// Send email with OTP
		try {
			await resend.emails.send({
				from: "Cocoa Comaa <noreply@cocoacomaa.com>",
				to: [email],
				subject: "Reset Your Password - OTP",
				html: `
					<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
						<h1 style="color: #333; text-align: center;">Reset Your Password</h1>
						<p style="color: #666; font-size: 16px;">Hi ${user.name || "there"},</p>
						<p style="color: #666; font-size: 16px;">You requested to reset your password. Use the OTP below to reset your password:</p>
						<div style="text-align: center; margin: 30px 0;">
							<span style="font-size: 32px; font-weight: bold; color: #333; background: #f5f5f5; padding: 15px 30px; border-radius: 8px; letter-spacing: 5px;">${token}</span>
						</div>
						<p style="color: #666; font-size: 14px;">This OTP will expire in 15 minutes.</p>
						<p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
						<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
						<p style="color: #999; font-size: 12px; text-align: center;">© 2024 Cocoa Comaa. All rights reserved.</p>
					</div>
				`,
				text: `
					Hi ${user.name || "there"},
					You requested to reset your password. Use the OTP below to reset your password:
					${token}
					This OTP will expire in 15 minutes.
					If you didn't request this password reset, please ignore this email.
				`,
			});
		} catch (emailError) {
			console.error("Error sending email:", emailError);
			return NextResponse.json(
				{ message: "Failed to send OTP email. Please try again." },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ message: "If this email exists, an OTP will be sent." },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Forgot password error:", error);
		return NextResponse.json(
			{ message: "Something went wrong. Please try again." },
			{ status: 500 },
		);
	}
}
