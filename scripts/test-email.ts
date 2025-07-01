import { sendOrderConfirmationEmail } from "../src/lib/email";

// Sample order data for testing
const sampleOrder = {
	id: "clyxyzabc123",
	total: "850.00",
	createdAt: new Date(),
	notes: "Please make the brownies extra sweet!",
	pickupDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
	orderType: "cake-orders" as const,
	orderItems: [
		{
			itemName: "Chocolate Fudge Brownie",
			quantity: 2,
			price: "250.00",
		},
		{
			itemName: "Red Velvet Cupcakes (Set of 6)",
			quantity: 1,
			price: "350.00",
		},
	],
	user: {
		name: "John Doe",
		email: "test@example.com", // Change this to your email for testing
	},
	address: null,
};

const samplePostalOrder = {
	id: "clyxyzdef456",
	total: "1200.00",
	createdAt: new Date(),
	notes: "Please handle with care - fragile items",
	pickupDateTime: null,
	orderType: "postal-brownies" as const,
	orderItems: [
		{
			itemName: "Premium Brownie Combo Box",
			quantity: 1,
			price: "1200.00",
		},
	],
	user: {
		name: "Jane Smith",
		email: "test@example.com", // Change this to your email for testing
	},
	address: {
		addressLine1: "123 Main Street",
		addressLine2: "Apartment 4B",
		city: "Mumbai",
		state: "Maharashtra",
		zip: "400001",
	},
};

async function testEmails() {
	console.log("🧪 Testing Order Confirmation Emails...\n");

	try {
		console.log("📧 Testing Cake Order Email...");
		const result1 = await sendOrderConfirmationEmail(sampleOrder);
		console.log("Result:", result1.success ? "✅ Success" : "❌ Failed");

		console.log("\n📦 Testing Postal Brownies Email...");
		const result2 = await sendOrderConfirmationEmail(samplePostalOrder);
		console.log("Result:", result2.success ? "✅ Success" : "❌ Failed");

		console.log("\n🎉 Email tests completed!");
	} catch (error) {
		console.error("❌ Test failed:", error);
	}
}

testEmails();
