import "dotenv/config";

import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from ".";
import { desserts, orderItems, orders, users, postalCombos } from "./schema";

async function seed() {
	try {
		// await db.delete(orderItems).execute();

		// await db.delete(desserts).execute();

		// console.log("Seeding desserts...");

		// const dessertNames = [
		// 	"Chocolate Lava Cake",
		// 	"Vanilla Bean Cheesecake",
		// 	"Strawberry Shortcake",
		// 	"Tiramisu",
		// 	"Red Velvet Cupcake",
		// 	"Lemon Tart",
		// 	"Chocolate Truffle",
		// 	"Apple Pie",
		// 	"Crème Brûlée",
		// 	"Macarons",
		// 	"Brownies",
		// 	"Fruit Tart",
		// 	"Panna Cotta",
		// 	"Chocolate Mousse",
		// 	"Carrot Cake",
		// 	"Ice Cream Sundae",
		// 	"Banana Bread",
		// 	"Key Lime Pie",
		// 	"Pecan Pie",
		// 	"Éclair",
		// ];

		// const dessertDescriptions = [
		// 	"Rich chocolate cake with a molten center",
		// 	"Creamy cheesecake with vanilla bean specks",
		// 	"Light sponge cake with fresh strawberries and cream",
		// 	"Italian coffee-flavored dessert with mascarpone",
		// 	"Moist red velvet cake with cream cheese frosting",
		// 	"Tangy lemon curd in a buttery pastry shell",
		// 	"Decadent chocolate truffle with cocoa powder",
		// 	"Classic apple pie with cinnamon spice",
		// 	"French custard dessert with caramelized sugar",
		// 	"Delicate French sandwich cookies",
		// 	"Fudgy chocolate brownies with nuts",
		// 	"Fresh seasonal fruits on pastry cream",
		// 	"Smooth Italian dessert with berry coulis",
		// 	"Light and airy chocolate mousse",
		// 	"Spiced carrot cake with cream cheese frosting",
		// 	"Ice cream with toppings and sauces",
		// 	"Moist banana bread with walnuts",
		// 	"Tart lime pie with graham cracker crust",
		// 	"Rich pecan pie with caramel filling",
		// 	"French pastry filled with cream",
		// ];

		// const dessertData: (typeof desserts.$inferInsert)[] = dessertNames.map(
		// 	(name, index) => ({
		// 		name,
		// 		price: faker.number.int({ min: 800, max: 3500 }).toString(), // $8-$35
		// 		description: dessertDescriptions[index],
		// 		imageUrl: `https://images.unsplash.com/photo-${
		// 			[
		// 				"1578985545622-28b7a3e4a137", // Chocolate cake
		// 				"1565958011703-361f7fa0ccf5", // Cheesecake
		// 				"1464349095431-4b72803b8f97", // Strawberry cake
		// 				"1571877227200-a0d98ea607e9", // Tiramisu
		// 				"1563805042-7684c019e1cb", // Red velvet
		// 				"1578985545622-28b7a3e4a137", // Lemon tart
		// 				"1578985545622-28b7a3e4a137", // Chocolate truffle
		// 				"1549312185-22cc2b96ae2b", // Apple pie
		// 				"1578985545622-28b7a3e4a137", // Crème brûlée
		// 				"1571506602739-9cb0c7c0b2df", // Macarons
		// 				"1571066811602-716837d681de", // Brownies
		// 				"1578985545622-28b7a3e4a137", // Fruit tart
		// 				"1578985545622-28b7a3e4a137", // Panna cotta
		// 				"1563805042-7684c019e1cb", // Chocolate mousse
		// 				"1578985545622-28b7a3e4a137", // Carrot cake
		// 				"1563805042-7684c019e1cb", // Ice cream
		// 				"1578985545622-28b7a3e4a137", // Banana bread
		// 				"1578985545622-28b7a3e4a137", // Key lime pie
		// 				"1578985545622-28b7a3e4a137", // Pecan pie
		// 				"1578985545622-28b7a3e4a137", // Éclair
		// 			][index % 20]
		// 		}?w=400&h=300&fit=crop`,
		// 		status: "available",
		// 	}),
		// );

		// await db.insert(desserts).values(dessertData).execute();

		// console.log("Seeded desserts");

		// Seed postal combos
		console.log("Seeding postal combos...");

		await db.delete(postalCombos).execute();

		const postalComboData: (typeof postalCombos.$inferInsert)[] = [
			{
				name: "Classic Postal Brownies",
				description:
					"Perfect for sharing with family and friends. Our signature fudgy brownies with a rich chocolate flavor.",
				price: "650.00",
				imageUrl:
					"https://images.unsplash.com/photo-1571066811602-716837d681de?w=400&h=300&fit=crop",
				comboType: "classic",
				items: [
					"6 Classic Fudgy Brownies",
					"Premium Belgian Chocolate",
					"Elegant Gift Box",
					"Free Shipping",
				],
				status: "available",
			},
			{
				name: "Premium Postal Brownies",
				description:
					"Elevated brownies with premium toppings and nuts. A delightful treat for special occasions.",
				price: "750.00",
				imageUrl:
					"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
				comboType: "premium",
				items: [
					"8 Premium Brownies with Nuts",
					"Caramel & Sea Salt Variants",
					"Premium Packaging",
					"Personalized Note Card",
					"Express Shipping",
				],
				status: "available",
			},
			{
				name: "Deluxe Postal Brownies",
				description:
					"The ultimate brownie experience with assorted flavors and premium presentation.",
				price: "850.00",
				imageUrl:
					"https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop",
				comboType: "deluxe",
				items: [
					"12 Assorted Gourmet Brownies",
					"Triple Chocolate, Walnut & Caramel",
					"Luxury Gift Box with Ribbon",
					"Handwritten Note",
					"Premium Express Delivery",
					"Thank You Card",
				],
				status: "available",
			},
		];

		await db.insert(postalCombos).values(postalComboData).execute();

		console.log("Seeded postal combos");

		// console.log("deleting customers");
		// await db.delete(orders).execute();
		// await db.delete(users).execute();
		// const customerData: (typeof users.$inferInsert)[] = [
		// 	{
		// 		name: faker.person.fullName(),
		// 		email: faker.internet.email(),
		// 		phone: faker.phone.number(),
		// 		role: "customer",
		// 	},
		// 	{
		// 		name: faker.person.fullName(),
		// 		email: faker.internet.email(),
		// 		phone: faker.phone.number(),
		// 		role: "customer",
		// 	},
		// ];

		// await db.insert(users).values(customerData).execute();
		// console.log("Seeded customers");

		// const customersDa = await db.query.users.findMany({
		// 	columns: { id: true },
		// 	where: eq(users.role, "customer"),
		// });

		// console.log("Deleting orders...");
		// const orderData: (typeof orders.$inferInsert)[] = [
		// 	{
		// 		userId: customersDa[0].id,
		// 		total: "1000",
		// 		status: "pending",
		// 		paymentStatus: "pending",
		// 		razorpayOrderId: faker.string.uuid(),
		// 		razorpayPaymentId: faker.string.uuid(),
		// 		razorpaySignature: faker.string.uuid(),
		// 		notes: faker.lorem.sentence(),
		// 		pickupDateTime: faker.date.future(),
		// 	},
		// 	{
		// 		userId: customersDa[1].id,
		// 		total: "1000",
		// 		status: "ready",
		// 		paymentStatus: "captured",
		// 		razorpayOrderId: faker.string.uuid(),
		// 		razorpayPaymentId: faker.string.uuid(),
		// 		razorpaySignature: faker.string.uuid(),
		// 		notes: faker.lorem.sentence(),
		// 		pickupDateTime: faker.date.future(),
		// 	},
		// 	{
		// 		userId: customersDa[0].id,
		// 		total: "1000",
		// 		status: "paid",
		// 		paymentStatus: "captured",
		// 		razorpayOrderId: faker.string.uuid(),
		// 		razorpayPaymentId: faker.string.uuid(),
		// 		razorpaySignature: faker.string.uuid(),
		// 		notes: faker.lorem.sentence(),
		// 		pickupDateTime: faker.date.future(),
		// 	},
		// 	{
		// 		userId: customersDa[1].id,
		// 		total: "1000",
		// 		status: "confirmed",
		// 		paymentStatus: "captured",
		// 		razorpayOrderId: faker.string.uuid(),
		// 		razorpayPaymentId: faker.string.uuid(),
		// 		razorpaySignature: faker.string.uuid(),
		// 		notes: faker.lorem.sentence(),
		// 		pickupDateTime: faker.date.future(),
		// 	},
		// 	{
		// 		userId: customersDa[0].id,
		// 		total: "1000",
		// 		status: "completed",
		// 		paymentStatus: "captured",
		// 		razorpayOrderId: faker.string.uuid(),
		// 		razorpayPaymentId: faker.string.uuid(),
		// 		razorpaySignature: faker.string.uuid(),
		// 		notes: faker.lorem.sentence(),
		// 		pickupDateTime: faker.date.future(),
		// 	},
		// ];

		// await db.insert(orders).values(orderData).execute();

		// console.log("Seeded orders");
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

void seed().finally(() => {
	process.exit(0);
});
