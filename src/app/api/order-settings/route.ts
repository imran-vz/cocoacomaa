import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { orderSettings, users } from "@/lib/db/schema";

const updateOrderSettingsSchema = z.object({
	allowedDays: z.array(z.number().min(0).max(6)).min(1),
	isActive: z.boolean(),
});

// GET - Fetch current order settings
export async function GET() {
	try {
		// Get the most recent active order settings
		const currentSettings = await db.query.orderSettings.findFirst({
			where: eq(orderSettings.isActive, true),
			orderBy: (orderSettings, { desc }) => [desc(orderSettings.createdAt)],
		});

		// If no settings exist, return default (Monday and Tuesday)
		const defaultSettings = {
			id: 0,
			allowedDays: [1, 2], // Monday and Tuesday
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		return NextResponse.json({
			success: true,
			settings: currentSettings || defaultSettings,
		});
	} catch (error) {
		console.error("Error fetching order settings:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch order settings" },
			{ status: 500 },
		);
	}
}

// PUT - Update order settings
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
		const validation = updateOrderSettingsSchema.safeParse(body);

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

		const { allowedDays, isActive } = validation.data;

		// Deactivate all previous settings
		await db
			.update(orderSettings)
			.set({ isActive: false, updatedAt: new Date() });

		// Create new settings
		const newSettings = await db
			.insert(orderSettings)
			.values({
				allowedDays,
				isActive,
			})
			.returning();

		return NextResponse.json({
			success: true,
			settings: newSettings[0],
		});
	} catch (error) {
		console.error("Error updating order settings:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update order settings" },
			{ status: 500 },
		);
	}
}
