import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { postalOrderSettings, users } from "@/lib/db/schema";

const postalOrderSettingsSchema = z
	.object({
		name: z
			.string()
			.min(1, "Name is required")
			.max(100, "Name must be less than 100 characters"),
		month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
		orderStartDate: z.iso.date("Invalid order start date"),
		orderEndDate: z.iso.date("Invalid order end date"),
		dispatchStartDate: z.iso.date("Invalid dispatch start date"),
		dispatchEndDate: z.iso.date("Invalid dispatch end date"),
		isActive: z.boolean(),
	})
	.refine(
		(data) => {
			const orderStart = new Date(data.orderStartDate);
			const orderEnd = new Date(data.orderEndDate);
			const dispatchStart = new Date(data.dispatchStartDate);
			const dispatchEnd = new Date(data.dispatchEndDate);

			// Check if order period is valid (allow same day)
			if (orderStart > orderEnd) {
				return false;
			}

			// Check if dispatch period is valid (allow same day)
			if (dispatchStart > dispatchEnd) {
				return false;
			}

			// Check if periods don't overlap (order end must be before dispatch start)
			if (orderEnd >= dispatchStart) {
				return false;
			}

			// Check if all dates are within the specified month
			const monthStart = new Date(`${data.month}-01`);
			const monthEnd = new Date(
				monthStart.getFullYear(),
				monthStart.getMonth() + 1,
				0,
			);

			return (
				orderStart >= monthStart &&
				orderStart <= monthEnd &&
				orderEnd >= monthStart &&
				orderEnd <= monthEnd &&
				dispatchStart >= monthStart &&
				dispatchStart <= monthEnd &&
				dispatchEnd >= monthStart &&
				dispatchEnd <= monthEnd
			);
		},
		{
			error:
				"Invalid date ranges: order and dispatch periods must not overlap, all dates must be within the specified month, order end date must be on or after start date, and dispatch end date must be on or after start date",
		},
	);

const rangesOverlap = (start1: Date, end1: Date, start2: Date, end2: Date) => {
	return start1 <= end2 && end1 >= start2;
};

// GET - Fetch postal order settings (optionally filter by month)
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const month = searchParams.get("month");

		if (month) {
			// Get settings for specific month
			const settings = await db.query.postalOrderSettings.findMany({
				where: and(
					eq(postalOrderSettings.month, month),
					eq(postalOrderSettings.isActive, true),
				),
				orderBy: (postalOrderSettings, { desc }) => [
					desc(postalOrderSettings.createdAt),
				],
			});

			return NextResponse.json({
				success: true,
				settings: settings,
			});
		}

		const settings = await db.query.postalOrderSettings.findMany({
			where: eq(postalOrderSettings.isActive, true),
			orderBy: (postalOrderSettings, { desc }) => [
				desc(postalOrderSettings.createdAt),
			],
		});

		return NextResponse.json({
			success: true,
			settings: settings,
		});
	} catch (error) {
		console.error("Error fetching postal order settings:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch postal order settings" },
			{ status: 500 },
		);
	}
}

// POST - Create new postal order settings
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		// Check if user is admin
		const user = await db.query.users.findFirst({
			where: eq(users.id, session.user.id),
		});

		if (user?.role !== "admin") {
			return NextResponse.json(
				{ success: false, error: "Admin access required" },
				{ status: 403 },
			);
		}

		const body = await request.json();
		const validation = postalOrderSettingsSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid data",
					details: validation.error.issues,
				},
				{ status: 400 },
			);
		}

		const data = validation.data;

		// Check for overlapping slots in the same month
		const existingSlots = await db.query.postalOrderSettings.findMany({
			where: and(
				eq(postalOrderSettings.month, data.month),
				eq(postalOrderSettings.isActive, true),
			),
		});

		// Check if the new slot overlaps with any existing slots
		const newOrderStart = new Date(data.orderStartDate);
		const newOrderEnd = new Date(data.orderEndDate);
		const newDispatchStart = new Date(data.dispatchStartDate);
		const newDispatchEnd = new Date(data.dispatchEndDate);

		// Helper function to check if two date ranges overlap
		// Range A overlaps with Range B if: A.start <= B.end AND A.end >= B.start

		for (const slot of existingSlots) {
			const slotOrderStart = new Date(slot.orderStartDate);
			const slotOrderEnd = new Date(slot.orderEndDate);
			const slotDispatchStart = new Date(slot.dispatchStartDate);
			const slotDispatchEnd = new Date(slot.dispatchEndDate);

			// Check if order periods overlap
			if (
				rangesOverlap(newOrderStart, newOrderEnd, slotOrderStart, slotOrderEnd)
			) {
				return NextResponse.json(
					{
						success: false,
						error: `Order period overlaps with existing order period of slot: ${slot.name}`,
					},
					{ status: 409 },
				);
			}

			// Check if dispatch periods overlap
			if (
				rangesOverlap(
					newDispatchStart,
					newDispatchEnd,
					slotDispatchStart,
					slotDispatchEnd,
				)
			) {
				return NextResponse.json(
					{
						success: false,
						error: `Dispatch period overlaps with existing dispatch period of slot: ${slot.name}`,
					},
					{ status: 409 },
				);
			}

			// Check if new order period overlaps with existing dispatch periods
			if (
				rangesOverlap(
					newOrderStart,
					newOrderEnd,
					slotDispatchStart,
					slotDispatchEnd,
				)
			) {
				return NextResponse.json(
					{
						success: false,
						error: `Order period overlaps with dispatch period of slot: ${slot.name}`,
					},
					{ status: 409 },
				);
			}

			// Check if new dispatch period overlaps with existing order periods
			if (
				rangesOverlap(
					newDispatchStart,
					newDispatchEnd,
					slotOrderStart,
					slotOrderEnd,
				)
			) {
				return NextResponse.json(
					{
						success: false,
						error: `Dispatch period overlaps with order period of slot: ${slot.name}`,
					},
					{ status: 409 },
				);
			}
		}

		// Create new settings
		const newSettings = await db
			.insert(postalOrderSettings)
			.values({
				name: data.name,
				month: data.month,
				orderStartDate: data.orderStartDate,
				orderEndDate: data.orderEndDate,
				dispatchStartDate: data.dispatchStartDate,
				dispatchEndDate: data.dispatchEndDate,
				isActive: data.isActive,
			})
			.returning();

		return NextResponse.json({
			success: true,
			settings: newSettings[0],
		});
	} catch (error) {
		console.error("Error creating postal order settings:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to create postal order settings" },
			{ status: 500 },
		);
	}
}

// PUT - Update existing postal order settings
export async function PUT(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		// Check if user is admin
		const user = await db.query.users.findFirst({
			where: eq(users.id, session.user.id),
		});

		if (user?.role !== "admin") {
			return NextResponse.json(
				{ success: false, error: "Admin access required" },
				{ status: 403 },
			);
		}

		const body = await request.json();
		const { id, ...updateData } = body;

		if (!id) {
			return NextResponse.json(
				{ success: false, error: "Settings ID is required" },
				{ status: 400 },
			);
		}

		const validation = postalOrderSettingsSchema.safeParse(updateData);

		if (!validation.success) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid data",
					details: validation.error.issues,
				},
				{ status: 400 },
			);
		}

		const data = validation.data;

		// Check for overlapping slots in the same month (excluding the current slot being updated)
		const existingSlots = await db.query.postalOrderSettings.findMany({
			where: and(
				eq(postalOrderSettings.month, data.month),
				eq(postalOrderSettings.isActive, true),
			),
		});

		// Helper function to check if two date ranges overlap
		// Range A overlaps with Range B if: A.start <= B.end AND A.end >= B.start
		const rangesOverlap = (
			start1: Date,
			end1: Date,
			start2: Date,
			end2: Date,
		) => {
			return start1 <= end2 && end1 >= start2;
		};

		// Check if the updated slot overlaps with any existing slots (excluding itself)
		const newOrderStart = new Date(data.orderStartDate);
		const newOrderEnd = new Date(data.orderEndDate);
		const newDispatchStart = new Date(data.dispatchStartDate);
		const newDispatchEnd = new Date(data.dispatchEndDate);

		for (const slot of existingSlots) {
			// Skip the slot we're updating
			if (slot.id === id) continue;

			const slotOrderStart = new Date(slot.orderStartDate);
			const slotOrderEnd = new Date(slot.orderEndDate);
			const slotDispatchStart = new Date(slot.dispatchStartDate);
			const slotDispatchEnd = new Date(slot.dispatchEndDate);

			// Check if order periods overlap
			if (
				rangesOverlap(newOrderStart, newOrderEnd, slotOrderStart, slotOrderEnd)
			) {
				return NextResponse.json(
					{
						success: false,
						error: `Order period overlaps with existing order period of slot: ${slot.name}`,
					},
					{ status: 409 },
				);
			}

			// Check if dispatch periods overlap
			if (
				rangesOverlap(
					newDispatchStart,
					newDispatchEnd,
					slotDispatchStart,
					slotDispatchEnd,
				)
			) {
				return NextResponse.json(
					{
						success: false,
						error: `Dispatch period overlaps with existing dispatch period of slot: ${slot.name}`,
					},
					{ status: 409 },
				);
			}

			// Check if new order period overlaps with existing dispatch periods
			if (
				rangesOverlap(
					newOrderStart,
					newOrderEnd,
					slotDispatchStart,
					slotDispatchEnd,
				)
			) {
				return NextResponse.json(
					{
						success: false,
						error: `Order period overlaps with dispatch period of slot: ${slot.name}`,
					},
					{ status: 409 },
				);
			}

			// Check if new dispatch period overlaps with existing order periods
			if (
				rangesOverlap(
					newDispatchStart,
					newDispatchEnd,
					slotOrderStart,
					slotOrderEnd,
				)
			) {
				return NextResponse.json(
					{
						success: false,
						error: `Dispatch period overlaps with order period of slot: ${slot.name}`,
					},
					{ status: 409 },
				);
			}
		}

		// Update settings
		const updatedSettings = await db
			.update(postalOrderSettings)
			.set({
				name: data.name,
				month: data.month,
				orderStartDate: data.orderStartDate,
				orderEndDate: data.orderEndDate,
				dispatchStartDate: data.dispatchStartDate,
				dispatchEndDate: data.dispatchEndDate,
				isActive: data.isActive,
				updatedAt: new Date(),
			})
			.where(eq(postalOrderSettings.id, id))
			.returning();

		if (updatedSettings.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Settings not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			settings: updatedSettings[0],
		});
	} catch (error) {
		console.error("Error updating postal order settings:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update postal order settings" },
			{ status: 500 },
		);
	}
}

// DELETE - Delete postal order settings
export async function DELETE(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		// Check if user is admin
		const user = await db.query.users.findFirst({
			where: eq(users.id, session.user.id),
		});

		if (user?.role !== "admin") {
			return NextResponse.json(
				{ success: false, error: "Admin access required" },
				{ status: 403 },
			);
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ success: false, error: "Settings ID is required" },
				{ status: 400 },
			);
		}

		// Soft delete by setting isActive to false
		const deletedSettings = await db
			.update(postalOrderSettings)
			.set({
				isActive: false,
				updatedAt: new Date(),
			})
			.where(eq(postalOrderSettings.id, parseInt(id)))
			.returning();

		if (deletedSettings.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Settings not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Settings deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting postal order settings:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete postal order settings" },
			{ status: 500 },
		);
	}
}
