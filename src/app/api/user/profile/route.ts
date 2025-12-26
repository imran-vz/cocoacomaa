import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const updateProfileSchema = z.object({
	phone: z
		.string()
		.min(10, {
			error: "Phone number must be at least 10 digits.",
		})
		.regex(/^[0-9+\-\s()]+$/, {
			error: "Please enter a valid phone number.",
		})
		.optional(),
});

// PATCH - Update user profile
export async function PATCH(request: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { success, data, error } = updateProfileSchema.safeParse(
			await request.json(),
		);

		if (!success) {
			return NextResponse.json(
				{ error: error.issues[0].message },
				{ status: 400 },
			);
		}

		const updateData: Partial<{ phone: string; updatedAt: Date }> = {
			updatedAt: new Date(),
		};

		if (data.phone !== undefined) {
			updateData.phone = data.phone;
		}

		const [updatedUser] = await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, session.user.id))
			.returning({
				id: users.id,
				name: users.name,
				email: users.email,
				phone: users.phone,
			});

		if (!updatedUser) {
			return NextResponse.json(
				{ error: "Failed to update profile" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user profile:", error);
		return NextResponse.json(
			{ error: "Failed to update profile" },
			{ status: 500 },
		);
	}
}
