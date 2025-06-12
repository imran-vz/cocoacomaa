import "dotenv/config";
import { db } from ".";
import { desserts } from "./schema";
import { faker } from "@faker-js/faker";

async function seed() {
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
			price: faker.number.int({ min: 800, max: 3500 }), // $8-$35
			description: dessertDescriptions[index],
			isDeleted: false,
			enabled: true,
		}),
	);

	await db.insert(desserts).values(dessertData).execute();

	console.log("Seeded desserts");
}

void seed().finally(() => {
	process.exit(0);
});
