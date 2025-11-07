import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { addresses, customerContacts } from "@/lib/db/schema";

const updateContactSchema = z.object({
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

// PUT: Edit contact (soft delete old, create new)
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const contactId = Number.parseInt(id, 10);

		if (Number.isNaN(contactId)) {
			return NextResponse.json(
				{ error: "Invalid contact ID" },
				{ status: 400 },
			);
		}

		const body = await request.json();
		const validatedData = updateContactSchema.parse(body);

		// Verify contact belongs to user
		const existingContact = await db.query.customerContacts.findFirst({
			where: and(
				eq(customerContacts.id, contactId),
				eq(customerContacts.userId, session.user.id),
			),
		});

		if (!existingContact) {
			return NextResponse.json({ error: "Contact not found" }, { status: 404 });
		}

		// Soft delete old contact
		await db
			.update(customerContacts)
			.set({ isDeleted: true })
			.where(eq(customerContacts.id, contactId));

		// Create new address
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

		// Create new contact with updated info
		const [newContact] = await db
			.insert(customerContacts)
			.values({
				userId: session.user.id,
				name: validatedData.name,
				phone: validatedData.phone,
				addressId: newAddress.id,
				useCount: existingContact.useCount,
				lastUsedAt: existingContact.lastUsedAt,
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

		console.error("Error updating customer contact:", error);
		return NextResponse.json(
			{ error: "Failed to update contact" },
			{ status: 500 },
		);
	}
}

// DELETE: Soft delete contact
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const contactId = Number.parseInt(id, 10);

		if (Number.isNaN(contactId)) {
			return NextResponse.json(
				{ error: "Invalid contact ID" },
				{ status: 400 },
			);
		}

		// Verify contact belongs to user
		const existingContact = await db.query.customerContacts.findFirst({
			where: and(
				eq(customerContacts.id, contactId),
				eq(customerContacts.userId, session.user.id),
			),
		});

		if (!existingContact) {
			return NextResponse.json({ error: "Contact not found" }, { status: 404 });
		}

		// Soft delete
		await db
			.update(customerContacts)
			.set({ isDeleted: true })
			.where(eq(customerContacts.id, contactId));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting customer contact:", error);
		return NextResponse.json(
			{ error: "Failed to delete contact" },
			{ status: 500 },
		);
	}
}
