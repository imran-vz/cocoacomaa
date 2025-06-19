import bcrypt from "bcrypt";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { registerSchema } from "@/lib/schema";

export async function POST(request: Request) {
	try {
		const { success, data, error } = registerSchema.safeParse(
			await request.json(),
		);

		if (!success) {
			return NextResponse.json(
				{
					message: "All fields are required.",
					errors: error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const { name, email, password, phone } = data;

		// Basic email and phone validation
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			return NextResponse.json(
				{ message: "Invalid email address." },
				{ status: 400 },
			);
		}
		if (!/[0-9+\-\s()]{10,}/.test(phone)) {
			return NextResponse.json(
				{ message: "Invalid phone number." },
				{ status: 400 },
			);
		}
		if (password.length < 6) {
			return NextResponse.json(
				{ message: "Password must be at least 6 characters." },
				{ status: 400 },
			);
		}

		// Check for existing user
		const existing = await db.query.users.findFirst({
			where: or(eq(users.email, email), eq(users.phone, phone)),
		});
		if (existing) {
			return NextResponse.json(
				{ message: "Email or phone already in use." },
				{ status: 409 },
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await db.insert(users).values({
			name,
			email,
			phone,
			password: hashedPassword,
		});

		return NextResponse.json(
			{ message: "Registration successful." },
			{ status: 201 },
		);
	} catch (error) {
		console.error(" :84 | POST | error:", error);
		return NextResponse.json({ message: "Server error." }, { status: 500 });
	}
}
