import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { workshops } from "@/lib/db/schema";

export async function GET(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const workshop = await db.query.workshops.findFirst({
			where: and(
				eq(workshops.id, parseInt(id)),
				eq(workshops.isDeleted, false),
			),
		});

		if (!workshop) {
			return NextResponse.json(
				{ success: false, message: "Workshop not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: workshop,
		});
	} catch (error) {
		console.error("Error fetching workshop:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch workshop" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id || session.user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { id } = await params;
		const body = await request.json();
		const { title, description, amount, type, status, imageUrl } = body;

		if (!title || !description || !amount || !type) {
			return NextResponse.json(
				{ success: false, message: "Missing required fields" },
				{ status: 400 },
			);
		}

		if (!["online", "offline"].includes(type)) {
			return NextResponse.json(
				{ success: false, message: "Invalid workshop type" },
				{ status: 400 },
			);
		}

		if (status && !["active", "inactive"].includes(status)) {
			return NextResponse.json(
				{ success: false, message: "Invalid status" },
				{ status: 400 },
			);
		}

		const [updatedWorkshop] = await db
			.update(workshops)
			.set({
				title,
				description,
				amount: amount.toString(),
				type,
				imageUrl,
				status: status || "active",
				updatedAt: new Date(),
			})
			.where(eq(workshops.id, parseInt(id)))
			.returning();

		if (!updatedWorkshop) {
			return NextResponse.json(
				{ success: false, message: "Workshop not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: updatedWorkshop,
		});
	} catch (error) {
		console.error("Error updating workshop:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to update workshop" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id || session.user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { id } = await params;

		const [deletedWorkshop] = await db
			.update(workshops)
			.set({
				isDeleted: true,
				updatedAt: new Date(),
			})
			.where(eq(workshops.id, parseInt(id)))
			.returning();

		if (!deletedWorkshop) {
			return NextResponse.json(
				{ success: false, message: "Workshop not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Workshop deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting workshop:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to delete workshop" },
			{ status: 500 },
		);
	}
}
