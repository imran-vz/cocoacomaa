import "dotenv/config";
import type { Config } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || "";

export default {
	schema: "./src/lib/db/schema.ts",
	dialect: "postgresql",
	introspect: {
		casing: "preserve",
	},
	dbCredentials: {
		url: connectionString,
	},
} satisfies Config;
