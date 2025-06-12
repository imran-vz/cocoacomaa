import "dotenv/config";
import { db } from ".";
import { desserts } from "./schema";
import { faker } from "@faker-js/faker";

async function seed() {
	await db.delete(desserts).execute();

	console.log("Seeding desserts...");
	const dessertData: (typeof desserts.$inferInsert)[] = Array.from(
		{ length: 20 },
		() => ({
			name: faker.commerce.productName(),
			price: faker.number.int({ min: 500, max: 5000 }),
			description: faker.commerce.productDescription(),
			isDeleted: false,
			enabled: true,
		}),
	);

	await db.insert(desserts).values(dessertData).execute();

	console.log("Seeded desserts");
}

void seed();
