import "dotenv/config";

import { sendOrderStatusUpdateEmail } from "@/lib/email";

const sampleOrderData = {
	id: "ckl1m2n3o4p5q6r7s8t9u",
	status: "preparing",
	total: "1250.00",
	createdAt: new Date("2024-01-15T10:30:00.000Z"),
	notes: "Please make sure the cake is not too sweet. Thanks!",
	pickupDateTime: new Date("2024-01-17T15:30:00.000Z"),
	orderType: "cake-orders",
	user: {
		name: "Mohammed Imran",
		email: "mohammedimran86992@gmail.com",
	},
	orderItems: [
		{
			quantity: 1,
			price: "850.00",
			itemName: "Chocolate Truffle Cake",
		},
		{
			quantity: 2,
			price: "200.00",
			itemName: "Chocolate Brownies",
		},
	],
	address: null, // This is a pickup order, not postal
};

async function testStatusUpdateEmail() {
	try {
		console.log("🧪 Testing order status update email...");

		const result = await sendOrderStatusUpdateEmail(
			sampleOrderData,
			"confirmed", // Previous status
		);

		console.log("✅ Status update email sent successfully!");
		console.log("📧 Email ID:", result.data?.id);
		console.log("📬 Sent to:", sampleOrderData.user.email);
		console.log("📝 Status changed from: confirmed → preparing");
	} catch (error) {
		console.error("❌ Failed to send status update email:", error);
	}
}

// Test different status transitions
async function testMultipleStatuses() {
	const statuses = [
		{ from: "paid", to: "confirmed" },
		{ from: "confirmed", to: "preparing" },
		{ from: "preparing", to: "ready" },
		{ from: "ready", to: "completed" },
	];

	for (const { from, to } of statuses) {
		try {
			console.log(`\n🧪 Testing ${from} → ${to}...`);

			const testData = {
				...sampleOrderData,
				status: to,
				user: {
					...sampleOrderData.user,
					email: sampleOrderData.user.email, // Different email for each test
				},
			};

			await sendOrderStatusUpdateEmail(testData, from);
			console.log(`✅ ${from} → ${to} email sent successfully!`);
		} catch (error) {
			console.error(`❌ Failed to send ${from} → ${to} email:`, error);
		}

		// Add a small delay between emails
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}

// Run the tests
if (require.main === module) {
	console.log("🚀 Starting status update email tests...\n");

	testStatusUpdateEmail()
		.then(() => testMultipleStatuses())
		.then(() => {
			console.log("\n🎉 All tests completed!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("\n💥 Test failed:", error);
			process.exit(1);
		});
}
