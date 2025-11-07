import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { addresses, customerContacts } from "@/lib/db/schema";

// GET: Fetch user's active contacts (limit 10, sorted by lastUsedAt DESC)
export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const contacts = await db.query.customerContacts.findMany({
			where: and(
				eq(customerContacts.userId, session.user.id),
				eq(customerContacts.isDeleted, false),
			),
			with: {
				address: true,
			},
			orderBy: [desc(customerContacts.lastUsedAt)],
			limit: 10,
		});

		return NextResponse.json({ contacts });
	} catch (error) {
		console.error("Error fetching customer contacts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch contacts" },
			{ status: 500 },
		);
	}
}

const createContactSchema = z.object({
	name: z.string().min(2, { message: "Name must be at least 2 characters" }),
	phone: z
		.string()
		.min(10, { message: "Phone must be at least 10 digits" })
		.regex(/^[0-9+\-\s()]+$/, { message: "Invalid phone format" }),
	addressLine1: z.string().min(1, { message: "Address line 1 is required" }),
	addressLine2: z.string().optional(),
	city: z.string().min(1, { message: "City is required" }),
	state: z.string().min(1, { message: "State is required" }),
	zip: z.string().min(1, { message: "Zip code is required" }),
});

// POST: Create new contact
export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = createContactSchema.parse(body);

		// Check max 10 active contacts
		const activeContactsCount = await db
			.select()
			.from(customerContacts)
			.where(
				and(
					eq(customerContacts.userId, session.user.id),
					eq(customerContacts.isDeleted, false),
				),
			);

		if (activeContactsCount.length >= 10) {
			return NextResponse.json(
				{ error: "Maximum 10 contacts allowed" },
				{ status: 400 },
			);
		}

		// Create address first
		const [newAddress] = await db
			.insert(addresses)
			.values({
				userId: session.user.id,
				addressLine1: validatedData.addressLine1,
				addressLine2: validatedData.addressLine2,
				city: validatedData.city,
				state: validatedData.state,
				zip: validatedData.zip,
			})
			.returning();

		// Create contact
		const [newContact] = await db
			.insert(customerContacts)
			.values({
				userId: session.user.id,
				name: validatedData.name,
				phone: validatedData.phone,
				addressId: newAddress.id,
			})
			.returning();

		// Fetch with address
		const contactWithAddress = await db.query.customerContacts.findFirst({
			where: eq(customerContacts.id, newContact.id),
			with: {
				address: true,
			},
		});

		return NextResponse.json({ contact: contactWithAddress });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Error creating customer contact:", error);
		return NextResponse.json(
			{ error: "Failed to create contact" },
			{ status: 500 },
		);
	}
}
