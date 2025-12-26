import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
	type CakeOrderSettings,
	cakeOrderSettings,
	users,
} from "@/lib/db/schema";

const updateCakeOrderSettingsSchema = z.object({
	allowedDays: z.array(z.number().min(0).max(6)).min(1),
	isActive: z.boolean(),
	id: z.number(),
});

// GET - Fetch current cake order settings
export async function GET() {
	try {
		// Get the most recent active cake order settings
		const currentSettings = await db.query.cakeOrderSettings.findFirst({
			orderBy: (cakeOrderSettings, { desc }) => [desc(cakeOrderSettings.id)],
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
		console.error("Error fetching cake order settings:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch cake order settings" },
			{ status: 500 },
		);
	}
}

// PUT - Update cake order settings
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
		const validation = updateCakeOrderSettingsSchema.safeParse(body);

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

		const { allowedDays, isActive, id } = validation.data;

		let newSettings: CakeOrderSettings;
		if (id === 0) {
			[newSettings] = await db
				.insert(cakeOrderSettings)
				.values({
					allowedDays,
					isActive,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
		} else {
			[newSettings] = await db
				.update(cakeOrderSettings)
				.set({ updatedAt: new Date(), allowedDays, isActive })
				.where(eq(cakeOrderSettings.id, id))
				.returning();
		}

		return NextResponse.json({
			success: true,
			settings: newSettings,
		});
	} catch (error) {
		console.error("Error updating cake order settings:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update cake order settings" },
			{ status: 500 },
		);
	}
}
