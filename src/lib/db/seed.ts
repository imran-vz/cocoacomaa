import "dotenv/config";

import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from ".";
import { desserts, orderItems, orders, users } from "./schema";

async function seed() {
	try {
		await db.delete(orderItems).execute();

		await db.delete(desserts).execute();

		console.log("Seeding desserts...");

		const dessertNames = [
			"Chocolate Lava Cake",
			"Vanilla Bean Cheesecake",
			"Strawberry Shortcake",
			"Tiramisu",
			"Red Velvet Cupcake",
			"Lemon Tart",
			"Chocolate Truffle",
			"Apple Pie",
			"Crème Brûlée",
			"Macarons",
			"Brownies",
			"Fruit Tart",
			"Panna Cotta",
			"Chocolate Mousse",
			"Carrot Cake",
			"Ice Cream Sundae",
			"Banana Bread",
			"Key Lime Pie",
			"Pecan Pie",
			"Éclair",
		];

		const dessertDescriptions = [
			"Rich chocolate cake with a molten center",
			"Creamy cheesecake with vanilla bean specks",
			"Light sponge cake with fresh strawberries and cream",
			"Italian coffee-flavored dessert with mascarpone",
			"Moist red velvet cake with cream cheese frosting",
			"Tangy lemon curd in a buttery pastry shell",
			"Decadent chocolate truffle with cocoa powder",
			"Classic apple pie with cinnamon spice",
			"French custard dessert with caramelized sugar",
			"Delicate French sandwich cookies",
			"Fudgy chocolate brownies with nuts",
			"Fresh seasonal fruits on pastry cream",
			"Smooth Italian dessert with berry coulis",
			"Light and airy chocolate mousse",
			"Spiced carrot cake with cream cheese frosting",
			"Ice cream with toppings and sauces",
			"Moist banana bread with walnuts",
			"Tart lime pie with graham cracker crust",
			"Rich pecan pie with caramel filling",
			"French pastry filled with cream",
		];

		const dessertData: (typeof desserts.$inferInsert)[] = dessertNames.map(
			(name, index) => ({
				name,
				price: faker.number.int({ min: 800, max: 3500 }).toString(), // $8-$35
				description: dessertDescriptions[index],
				status: "available",
			}),
		);

		await db.insert(desserts).values(dessertData).execute();

		console.log("Seeded desserts");

		console.log("deleting customers");
		await db.delete(orders).execute();
		await db.delete(users).execute();

		const customerData: (typeof users.$inferInsert)[] = [
			{
				name: faker.person.fullName(),
				email: faker.internet.email(),
				phone: faker.phone.number(),
				role: "customer",
			},
			{
				name: faker.person.fullName(),
				email: faker.internet.email(),
				phone: faker.phone.number(),
				role: "customer",
			},
		];

		await db.insert(users).values(customerData).execute();
		console.log("Seeded customers");

		const customersDa = await db.query.users.findMany({
			columns: { id: true },
			where: eq(users.role, "customer"),
		});

		console.log("Deleting orders...");
		const orderData: (typeof orders.$inferInsert)[] = [
			{
				userId: customersDa[0].id,
				total: "1000",
				status: "pending",
				paymentStatus: "pending",
				razorpayOrderId: faker.string.uuid(),
				razorpayPaymentId: faker.string.uuid(),
				razorpaySignature: faker.string.uuid(),
				notes: faker.lorem.sentence(),
				pickupDateTime: faker.date.future(),
			},
			{
				userId: customersDa[1].id,
				total: "1000",
				status: "ready",
				paymentStatus: "captured",
				razorpayOrderId: faker.string.uuid(),
				razorpayPaymentId: faker.string.uuid(),
				razorpaySignature: faker.string.uuid(),
				notes: faker.lorem.sentence(),
				pickupDateTime: faker.date.future(),
			},
			{
				userId: customersDa[0].id,
				total: "1000",
				status: "paid",
				paymentStatus: "captured",
				razorpayOrderId: faker.string.uuid(),
				razorpayPaymentId: faker.string.uuid(),
				razorpaySignature: faker.string.uuid(),
				notes: faker.lorem.sentence(),
				pickupDateTime: faker.date.future(),
			},
			{
				userId: customersDa[1].id,
				total: "1000",
				status: "confirmed",
				paymentStatus: "captured",
				razorpayOrderId: faker.string.uuid(),
				razorpayPaymentId: faker.string.uuid(),
				razorpaySignature: faker.string.uuid(),
				notes: faker.lorem.sentence(),
				pickupDateTime: faker.date.future(),
			},
			{
				userId: customersDa[0].id,
				total: "1000",
				status: "completed",
				paymentStatus: "captured",
				razorpayOrderId: faker.string.uuid(),
				razorpayPaymentId: faker.string.uuid(),
				razorpaySignature: faker.string.uuid(),
				notes: faker.lorem.sentence(),
				pickupDateTime: faker.date.future(),
			},
		];

		await db.insert(orders).values(orderData).execute();

		console.log("Seeded orders");
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

void seed().finally(() => {
	process.exit(0);
});
