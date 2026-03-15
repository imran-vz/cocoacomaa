import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id || session.user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { id } = await params;
		const body = await request.json();
		const {
			title,
			description,
			amount,
			type,
			maxBookings,
			status,
			imageUrl,
			date,
			startTime,
			endTime,
		} = body;

		if (!title || !description || !amount || !type || !maxBookings) {
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

		// Date/time validation: all-or-nothing
		const hasDate = date && date.trim() !== "";
		const hasStartTime = startTime && startTime.trim() !== "";
		const hasEndTime = endTime && endTime.trim() !== "";
		const dateTimeFieldCount = [hasDate, hasStartTime, hasEndTime].filter(
			Boolean,
		).length;

		if (dateTimeFieldCount > 0 && dateTimeFieldCount < 3) {
			return NextResponse.json(
				{
					success: false,
					message:
						"If setting a schedule, date, start time, and end time are all required",
				},
				{ status: 400 },
			);
		}

		if (hasDate) {
			// Validate date format (YYYY-MM-DD)
			if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
				return NextResponse.json(
					{
						success: false,
						message: "Invalid date format. Expected YYYY-MM-DD",
					},
					{ status: 400 },
				);
			}

			// Validate the date is a real date
			const parsedDate = new Date(`${date}T12:00:00`);
			if (Number.isNaN(parsedDate.getTime())) {
				return NextResponse.json(
					{ success: false, message: "Invalid date value" },
					{ status: 400 },
				);
			}

			// Validate time format (HH:mm)
			const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
			if (!timeRegex.test(startTime)) {
				return NextResponse.json(
					{
						success: false,
						message: "Invalid start time format. Expected HH:mm (24-hour)",
					},
					{ status: 400 },
				);
			}
			if (!timeRegex.test(endTime)) {
				return NextResponse.json(
					{
						success: false,
						message: "Invalid end time format. Expected HH:mm (24-hour)",
					},
					{ status: 400 },
				);
			}

			// Validate end time is after start time
			if (endTime <= startTime) {
				return NextResponse.json(
					{ success: false, message: "End time must be after start time" },
					{ status: 400 },
				);
			}
		}

		const [updatedWorkshop] = await db
			.update(workshops)
			.set({
				title,
				description,
				amount: amount.toString(),
				type,
				maxBookings: parseInt(maxBookings.toString()),
				imageUrl,
				status: status || "active",
				date: hasDate ? date : null,
				startTime: hasStartTime ? startTime : null,
				endTime: hasEndTime ? endTime : null,
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
		const session = await auth.api.getSession({ headers: await headers() });
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
