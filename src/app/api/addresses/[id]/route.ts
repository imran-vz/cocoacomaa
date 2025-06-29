import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { addresses } from "@/lib/db/schema";

// DELETE - Delete an address
export async function DELETE(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const addressId = Number.parseInt(id);
		if (Number.isNaN(addressId)) {
			return NextResponse.json(
				{ error: "Invalid address ID" },
				{ status: 400 },
			);
		}

		// Check if address exists and belongs to user
		const existingAddress = await db.query.addresses.findFirst({
			where: and(
				eq(addresses.id, addressId),
				eq(addresses.userId, session.user.id),
			),
		});

		if (!existingAddress) {
			return NextResponse.json(
				{ error: "Address not found or unauthorized" },
				{ status: 404 },
			);
		}

		// Delete the address
		await db
			.update(addresses)
			.set({ isDeleted: true })
			.where(
				and(eq(addresses.id, addressId), eq(addresses.userId, session.user.id)),
			);

		return NextResponse.json({
			success: true,
			message: "Address deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting address:", error);
		return NextResponse.json(
			{ error: "Failed to delete address" },
			{ status: 500 },
		);
	}
}
