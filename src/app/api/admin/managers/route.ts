import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const createManagerSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Valid email is required"),
	phone: z.string().optional(),
});

export async function GET() {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const managers = await db
			.select()
			.from(users)
			.where(eq(users.role, "manager"));

		return NextResponse.json(managers);
	} catch (error) {
		console.error("Error fetching managers:", error);
		return NextResponse.json(
			{ error: "Failed to fetch managers" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = createManagerSchema.parse(body);

		// Check if email already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, validatedData.email))
			.limit(1);

		if (existingUser.length > 0) {
			return NextResponse.json(
				{ error: "Email already exists" },
				{ status: 400 },
			);
		}

		const [newManager] = await db
			.insert(users)
			.values({
				name: validatedData.name,
				email: validatedData.email,
				phone: validatedData.phone || null,
				role: "manager",
			})
			.returning();

		return NextResponse.json(newManager, { status: 201 });
	} catch (error) {
		console.error("Error creating manager:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid data", details: error.errors },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to create manager" },
			{ status: 500 },
		);
	}
}
