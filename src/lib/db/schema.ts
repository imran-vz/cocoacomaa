import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export const desserts = pgTable("desserts", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		name: d.varchar("name", { length: 255 }).notNull(),
		description: d.text("description").notNull(),
		price: d.varchar("price", { length: 10 }).notNull(),
		imageUrl: d.text("image_url"),
		status: d.varchar("status", { length: 50 }).notNull().default("available"),
		category: d
			.varchar("category", { length: 50 })
			.notNull()
			.default("regular"), // 'regular', 'brownie_combo'
		comboType: d.varchar("combo_type", { length: 100 }), // For brownie combos: 'classic', 'premium', 'deluxe'
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
		comboType: d.varchar("combo_type", { length: 100 }).notNull(), // 'classic', 'premium', 'deluxe'
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
		createdAt: d.timestamp("created_at").defaultNow().notNull(),
		updatedAt: d.timestamp("updated_at").defaultNow().notNull(),
		role: d
			.varchar("role", { enum: ["customer", "admin"] })
			.notNull()
			.default("customer"),
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
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id],
	}),
}));

export const orderSettings = pgTable("order_settings", (d) => {
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

export type OrderSettings = typeof orderSettings.$inferSelect;
