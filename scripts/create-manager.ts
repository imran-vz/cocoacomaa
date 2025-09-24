import "dotenv/config";

import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function createManagerUser() {
	const hashedPassword = await bcrypt.hash("M1a2n3a4g5e6r", 10);

	await db.insert(users).values({
		id: crypto.randomUUID(),
		name: "Manager User",
		email: "manager@cocoacomaa.com",
		password: hashedPassword,
		role: "manager",
	});

	console.log("Manager user created successfully");
	console.log("Email: manager@cocoacomaa.com");
	console.log("Password: M1a2n3a4g5e6r");
}

void createManagerUser()
	.catch(console.error)
	.finally(() => {
		process.exit(0);
	});