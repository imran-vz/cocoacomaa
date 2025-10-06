import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from ".";
import { type Dessert, desserts } from "./schema";

export async function fetchDesserts(
	category: Dessert["category"][] = ["dessert", "cake"],
) {
	const whereConditions = [
		eq(desserts.status, "available"),
		eq(desserts.isDeleted, false),
	];

	if (category.length === 1) {
		whereConditions.push(eq(desserts.category, category[0]));
	} else if (category.length > 1) {
		whereConditions.push(inArray(desserts.category, category));
	}

	const availableDesserts = await db
		.select()
		.from(desserts)
		.where(and(...whereConditions))
		.orderBy(asc(desserts.price));

	return availableDesserts;
}
