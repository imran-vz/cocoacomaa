import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
	type SpecialsSettings,
	specialsSettings,
	users,
} from "@/lib/db/schema";
import { fetchSpecialsSettings } from "@/lib/db/specials";

const updateSpecialsSettingsSchema = z
	.object({
		isActive: z.boolean(),
		pickupStartDate: z.string().refine((date) => {
			const parsedDate = new Date(date);
			return !Number.isNaN(parsedDate.getTime());
		}, "Invalid date format"),
		pickupEndDate: z.string().refine((date) => {
			const parsedDate = new Date(date);
			return !Number.isNaN(parsedDate.getTime());
		}, "Invalid date format"),
		pickupStartTime: z
			.string()
			.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
		pickupEndTime: z
			.string()
			.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
		description: z.string().optional(),
		id: z.number(),
	})
	.refine(
		(data) => {
			const startDate = new Date(data.pickupStartDate);
			const endDate = new Date(data.pickupEndDate);
			return startDate <= endDate;
		},
		{
			message: "Pickup end date must be on or after start date",
		},
	);

// GET - Fetch current specials settings
export async function GET() {
	try {
		// Get the most recent specials settings
		const currentSettings = await fetchSpecialsSettings();

		return NextResponse.json({ success: true, settings: currentSettings });
	} catch (error) {
		console.error("Error fetching specials settings:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch specials settings" },
			{ status: 500 },
		);
	}
}

// PUT - Update specials settings
export async function PUT(request: NextRequest) {
	try {
		const session = await auth();
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
		const validation = updateSpecialsSettingsSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid data",
					details: validation.error.errors,
				},
				{ status: 400 },
			);
		}

		const {
			isActive,
			pickupStartDate,
			pickupEndDate,
			pickupStartTime,
			pickupEndTime,
			description,
			id,
		} = validation.data;

		// Validate that pickup end time is after start time
		const startTime = new Date(`2000-01-01T${pickupStartTime}:00`);
		const endTime = new Date(`2000-01-01T${pickupEndTime}:00`);

		if (endTime <= startTime) {
			return NextResponse.json(
				{ success: false, error: "Pickup end time must be after start time" },
				{ status: 400 },
			);
		}

		let newSettings: SpecialsSettings;
		if (id === 0) {
			[newSettings] = await db
				.insert(specialsSettings)
				.values({
					isActive,
					pickupStartDate,
					pickupEndDate,
					pickupStartTime,
					pickupEndTime,
					description,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
		} else {
			[newSettings] = await db
				.update(specialsSettings)
				.set({
					updatedAt: new Date(),
					isActive,
					pickupStartDate,
					pickupEndDate,
					pickupStartTime,
					pickupEndTime,
					description,
				})
				.where(eq(specialsSettings.id, id))
				.returning();
		}

		return NextResponse.json({
			success: true,
			settings: newSettings,
		});
	} catch (error) {
		console.error("Error updating specials settings:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update specials settings" },
			{ status: 500 },
		);
	}
}
