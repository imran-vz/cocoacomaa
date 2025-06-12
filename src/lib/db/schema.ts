import { relations } from "drizzle-orm";
import { pgTable, primaryKey } from "drizzle-orm/pg-core";

export const desserts = pgTable("desserts", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		name: d.varchar("name", { length: 255 }).notNull(),
		price: d.integer("price").notNull(),
		description: d.varchar("description", { length: 255 }),
		isDeleted: d.boolean("is_deleted").notNull().default(false),
		enabled: d.boolean("enabled").notNull().default(true),
		createdAt: d.timestamp("created_at").notNull().defaultNow(),
		updatedAt: d.timestamp("updated_at").notNull().defaultNow(),
	};
});

export const customers = pgTable("customers", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		name: d.varchar("name", { length: 255 }).notNull(),
		email: d.varchar("email", { length: 255 }).notNull(),
		phone: d.varchar("phone", { length: 255 }).notNull(),
		isDeleted: d.boolean("is_deleted").notNull().default(false),
		createdAt: d.timestamp("created_at").notNull().defaultNow(),
		updatedAt: d.timestamp("updated_at").notNull().defaultNow(),
	};
});

export const customersRelations = relations(customers, ({ many }) => ({
	orders: many(orders),
}));

export const orders = pgTable("orders", (d) => {
	return {
		id: d.integer("id").primaryKey().generatedAlwaysAsIdentity(),
		customerId: d
			.integer("customer_id")
			.notNull()
			.references(() => customers.id),
		createdAt: d.timestamp("created_at").notNull().defaultNow(),
		deliveryCost: d
			.numeric("delivery_cost", { precision: 5, scale: 2 })
			.notNull()
			.default("0.00"),
		total: d.numeric("total", { precision: 10, scale: 2 }).notNull(),
		status: d
			.varchar("status", {
				enum: ["pending", "completed"],
			})
			.notNull(),
		isDeleted: d.boolean("is_deleted").notNull().default(false),
		paymentScreenshotUrl: d.varchar("payment_screenshot_url", {
			length: 255,
		}),
	};
});

export const ordersRelations = relations(orders, ({ many, one }) => ({
	orderItems: many(orderItems),
	customer: one(customers, {
		fields: [orders.customerId],
		references: [customers.id],
	}),
}));

export const orderItems = pgTable(
	"order_items",
	(d) => {
		return {
			orderId: d
				.integer("order_id")
				.notNull()
				.references(() => orders.id),
			dessertId: d
				.integer("dessert_id")
				.notNull()
				.references(() => desserts.id),
			quantity: d.integer("quantity").notNull(),
		};
	},
	(t) => [
		primaryKey({
			name: "order_items_pk",
			columns: [t.orderId, t.dessertId],
		}),
	],
);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
	dessert: one(desserts, {
		fields: [orderItems.dessertId],
		references: [desserts.id],
	}),
}));
