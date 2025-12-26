import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const updateManagerSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Valid email is required"),
	phone: z.string().optional(),
});

export async function PATCH(
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
		const validatedData = updateManagerSchema.parse(body);

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

		// Check if email already exists for another user
		if (validatedData.email !== existingManager[0].email) {
			const emailExists = await db
				.select()
				.from(users)
				.where(eq(users.email, validatedData.email))
				.limit(1);

			if (emailExists.length > 0) {
				return NextResponse.json(
					{ error: "Email already exists" },
					{ status: 400 },
				);
			}
		}

		const [updatedManager] = await db
			.update(users)
			.set({
				name: validatedData.name,
				email: validatedData.email,
				phone: validatedData.phone || null,
				updatedAt: new Date(),
			})
			.where(eq(users.id, id))
			.returning();

		return NextResponse.json(updatedManager);
	} catch (error) {
		console.error("Error updating manager:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid data", details: error.issues },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to update manager" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

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

		await db.delete(users).where(eq(users.id, id));

		return NextResponse.json({ message: "Manager deleted successfully" });
	} catch (error) {
		console.error("Error deleting manager:", error);
		return NextResponse.json(
			{ error: "Failed to delete manager" },
			{ status: 500 },
		);
	}
}
