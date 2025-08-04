import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { pgTable, primaryKey } from "drizzle-orm/pg-core";

export const desserts = pgTable("desserts", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		name: d.varchar("name", { length: 255 }).notNull(),
		description: d.text("description").notNull(),
		price: d.varchar("price", { length: 10 }).notNull(),
		imageUrl: d.text("image_url"),
		status: d
			.varchar("status", { enum: ["available", "unavailable"] })
			.notNull()
			.default("available"),
		category: d
			.varchar("category", { enum: ["cake", "dessert", "special"] })
			.notNull()
			.default("dessert"),
		leadTimeDays: d.integer("lead_time_days").notNull().default(3), // Lead time in days
		createdAt: d
			.timestamp("created_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp("updated_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	};
});

export const dessertsRelations = relations(desserts, ({ many }) => ({
	orderItems: many(orderItems),
}));

export const orders = pgTable("orders", (d) => {
	return {
		id: d
			.text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: d
			.text("user_id")
			.notNull()
			.references(() => users.id),
		createdAt: d.timestamp("created_at").notNull().defaultNow(),
		updatedAt: d.timestamp("updated_at").notNull().defaultNow(),
		total: d.numeric("total", { precision: 10, scale: 2 }).notNull(),
		deliveryCost: d
			.numeric("delivery_cost", { precision: 10, scale: 2 })
			.default("0"),
		status: d
			.varchar("status", {
				enum: [
					"pending",
					"payment_pending",
					"paid",
					"confirmed",
					"preparing",
					"ready",
					"completed",
					"cancelled",
				],
			})
			.notNull()
			.default("pending"),
		isDeleted: d.boolean("is_deleted").notNull().default(false),
		pickupDateTime: d.timestamp("pickup_date_time"),
		// Razorpay fields
		razorpayOrderId: d.varchar("razorpay_order_id", { length: 255 }),
		razorpayPaymentId: d.varchar("razorpay_payment_id", { length: 255 }),
		razorpaySignature: d.varchar("razorpay_signature", { length: 255 }),
		paymentStatus: d
			.varchar("payment_status", {
				enum: [
					"pending",
					"created",
					"authorized",
					"captured",
					"refunded",
					"failed",
				],
			})
			.notNull()
			.default("pending"),
		notes: d.text("notes"),
		orderType: d
			.varchar("order_type", {
				enum: ["cake-orders", "postal-brownies"],
			})
			.notNull()
			.default("cake-orders"),
		// Address fields for postal brownie orders
		addressId: d.integer("address_id").references(() => addresses.id),
	};
});

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

export const ordersRelations = relations(orders, ({ many, one }) => ({
	orderItems: many(orderItems),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id],
	}),
	address: one(addresses, {
		fields: [orders.addressId],
		references: [addresses.id],
	}),
}));

export const orderItems = pgTable("order_items", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		orderId: d
			.text("order_id")
			.notNull()
			.references(() => orders.id),
		itemType: d
			.varchar("item_type", { enum: ["dessert", "postal-combo"] })
			.notNull(),
		dessertId: d.integer("dessert_id").references(() => desserts.id),
		postalComboId: d
			.integer("postal_combo_id")
			.references(() => postalCombos.id),
		quantity: d.integer("quantity").notNull(),
		price: d.numeric("price", { precision: 10, scale: 2 }).notNull(),
		// Store item name for historical purposes (in case item is deleted/modified)
		itemName: d.varchar("item_name", { length: 255 }).notNull(),
	};
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
	dessert: one(desserts, {
		fields: [orderItems.dessertId],
		references: [desserts.id],
	}),
	postalCombo: one(postalCombos, {
		fields: [orderItems.postalComboId],
		references: [postalCombos.id],
	}),
}));

export const postalCombos = pgTable("postal_combos", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		name: d.varchar("name", { length: 255 }).notNull(),
		description: d.text("description").notNull(),
		price: d.numeric("price", { precision: 10, scale: 2 }).notNull(), // Price in rupees
		imageUrl: d.text("image_url"),
		items: d.jsonb("items").notNull().$type<string[]>(), // Array of included items
		status: d
			.varchar("status", {
				enum: ["available", "unavailable"],
			})
			.notNull()
			.default("available"),
		isDeleted: d.boolean("is_deleted").notNull().default(false),
		createdAt: d
			.timestamp("created_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp("updated_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	};
});

export const postalCombosRelations = relations(postalCombos, ({ many }) => ({
	orderItems: many(orderItems),
}));

export const users = pgTable("users", (d) => {
	return {
		id: d
			.text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		name: d.text("name"),
		email: d.text("email").notNull().unique(),
		phone: d.text("phone"),
		password: d.text("password"),
		// NextAuth required fields
		emailVerified: d.timestamp("emailVerified", { mode: "date" }),
		image: d.text("image"),
		createdAt: d.timestamp("created_at").defaultNow().notNull(),
		updatedAt: d.timestamp("updated_at").defaultNow().notNull(),
		role: d
			.varchar("role", { enum: ["customer", "admin"] })
			.notNull()
			.default("customer"),
	};
});

// NextAuth required tables
export const accounts = pgTable(
	"account",
	(d) => ({
		userId: d
			.text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: d.text("type").notNull(),
		provider: d.text("provider").notNull(),
		providerAccountId: d.text("providerAccountId").notNull(),
		refresh_token: d.text("refresh_token"),
		access_token: d.text("access_token"),
		expires_at: d.integer("expires_at"),
		token_type: d.text("token_type"),
		scope: d.text("scope"),
		id_token: d.text("id_token"),
		session_state: d.text("session_state"),
	}),
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
	}),
);

export const sessions = pgTable("session", (d) => ({
	sessionToken: d.text("sessionToken").notNull().primaryKey(),
	userId: d
		.text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: d.timestamp("expires", { mode: "date" }).notNull(),
}));

export const verificationTokens = pgTable(
	"verificationToken",
	(d) => ({
		identifier: d.text("identifier").notNull(),
		token: d.text("token").notNull(),
		expires: d.timestamp("expires", { mode: "date" }).notNull(),
	}),
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
	}),
);

export const passwordResetTokens = pgTable("password_reset_tokens", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		email: d.text("email").notNull(),
		token: d.text("token").notNull().unique(),
		expiresAt: d.timestamp("expires_at").notNull(),
		createdAt: d.timestamp("created_at").defaultNow().notNull(),
		used: d.boolean("used").notNull().default(false),
	};
});

export const addresses = pgTable("addresses", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		userId: d
			.text("user_id")
			.notNull()
			.references(() => users.id),
		addressLine1: d.varchar("address_line_1", { length: 255 }).notNull(),
		addressLine2: d.varchar("address_line_2", { length: 255 }),
		city: d.varchar("city", { length: 100 }).notNull(),
		state: d.varchar("state", { length: 100 }).notNull(),
		zip: d.varchar("zip", { length: 20 }).notNull(),
		isDeleted: d.boolean("is_deleted").notNull().default(false),
		createdAt: d
			.timestamp("created_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp("updated_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	};
});

export const usersRelations = relations(users, ({ many }) => ({
	address: many(addresses),
	orders: many(orders),
	workshopOrders: many(workshopOrders),
	passwordResetTokens: many(passwordResetTokens),
	accounts: many(accounts, { relationName: "user_accounts" }),
	sessions: many(sessions, { relationName: "user_sessions" }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
		relationName: "account_user",
	}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
		relationName: "session_user",
	}),
}));

export const passwordResetTokensRelations = relations(
	passwordResetTokens,
	({ one }) => ({
		user: one(users, {
			fields: [passwordResetTokens.email],
			references: [users.email],
		}),
	}),
);

export const addressesRelations = relations(addresses, ({ one }) => ({
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id],
	}),
}));

export const cakeOrderSettings = pgTable("cake_order_settings", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		allowedDays: d.jsonb("allowed_days").notNull().$type<number[]>(), // Array of day numbers (0-6, where 0=Sunday)
		isActive: d.boolean("is_active").notNull().default(true),
		createdAt: d
			.timestamp("created_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp("updated_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	};
});

export type CakeOrderSettings = typeof cakeOrderSettings.$inferSelect;

export const postalOrderSettings = pgTable("postal_order_settings", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		name: d.varchar("name", { length: 100 }).notNull(), // Name for the slot (e.g., "Early Month", "Mid Month")
		month: d.varchar("month", { length: 7 }).notNull(), // Format: "YYYY-MM"
		orderStartDate: d.date("order_start_date").notNull(),
		orderEndDate: d.date("order_end_date").notNull(),
		dispatchStartDate: d.date("dispatch_start_date").notNull(),
		dispatchEndDate: d.date("dispatch_end_date").notNull(),
		isActive: d.boolean("is_active").notNull().default(true),
		createdAt: d
			.timestamp("created_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp("updated_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	};
});

export const specialsSettings = pgTable("specials_settings", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		isActive: d.boolean("is_active").notNull().default(true),
		pickupDate: d.date("pickup_date").notNull(), // Programmable pickup date
		pickupStartTime: d
			.varchar("pickup_start_time", { length: 5 })
			.notNull()
			.default("10:00"), // Format: "HH:MM"
		pickupEndTime: d
			.varchar("pickup_end_time", { length: 5 })
			.notNull()
			.default("18:00"), // Format: "HH:MM"
		description: d.text("description"), // Optional description for the special
		createdAt: d
			.timestamp("created_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp("updated_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	};
});

export type PostalOrderSettings = typeof postalOrderSettings.$inferSelect;
export type SpecialsSettings = typeof specialsSettings.$inferSelect;

// Workshops Schema
export const workshops = pgTable("workshops", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		title: d.varchar("title", { length: 255 }).notNull(),
		description: d.text("description").notNull(),
		amount: d.numeric("amount", { precision: 10, scale: 2 }).notNull(),
		type: d.varchar("type", { enum: ["online", "offline"] }).notNull(),
		maxBookings: d.integer("max_bookings").notNull().default(10),
		imageUrl: d.text("image_url"),
		status: d
			.varchar("status", { enum: ["active", "inactive"] })
			.notNull()
			.default("active"),
		isDeleted: d.boolean("is_deleted").notNull().default(false),
		createdAt: d
			.timestamp("created_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp("updated_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	};
});

export type Workshop = typeof workshops.$inferSelect;

export const workshopsRelations = relations(workshops, ({ many }) => ({
	workshopOrders: many(workshopOrders),
}));

// Workshop Orders Schema
export const workshopOrders = pgTable("workshop_orders", (d) => {
	return {
		id: d
			.text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: d
			.text("user_id")
			.notNull()
			.references(() => users.id),
		workshopId: d
			.integer("workshop_id")
			.notNull()
			.references(() => workshops.id),
		slots: d.integer("slots").notNull().default(1), // Number of slots booked (max 2)
		createdAt: d.timestamp("created_at").notNull().defaultNow(),
		updatedAt: d.timestamp("updated_at").notNull().defaultNow(),
		amount: d.numeric("amount", { precision: 10, scale: 2 }).notNull(),
		gatewayCost: d
			.numeric("gateway_cost", { precision: 10, scale: 2 })
			.notNull()
			.default("0"),
		status: d
			.varchar("status", {
				enum: ["pending", "payment_pending", "paid", "confirmed", "cancelled"],
			})
			.notNull()
			.default("pending"),
		isDeleted: d.boolean("is_deleted").notNull().default(false),
		// Razorpay fields
		razorpayOrderId: d.varchar("razorpay_order_id", { length: 255 }),
		razorpayPaymentId: d.varchar("razorpay_payment_id", { length: 255 }),
		razorpaySignature: d.varchar("razorpay_signature", { length: 255 }),
		paymentStatus: d
			.varchar("payment_status", {
				enum: [
					"pending",
					"created",
					"authorized",
					"captured",
					"refunded",
					"failed",
				],
			})
			.notNull()
			.default("pending"),
		notes: d.text("notes"),
		orderType: d
			.varchar("order_type", {
				enum: ["workshop"],
			})
			.notNull()
			.default("workshop"),
	};
});

export type WorkshopOrder = typeof workshopOrders.$inferSelect;

export const workshopOrdersRelations = relations(workshopOrders, ({ one }) => ({
	user: one(users, {
		fields: [workshopOrders.userId],
		references: [users.id],
	}),
	workshop: one(workshops, {
		fields: [workshopOrders.workshopId],
		references: [workshops.id],
	}),
}));
