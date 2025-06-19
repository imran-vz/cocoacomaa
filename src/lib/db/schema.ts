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
		status: d.varchar("status", { length: 50 }).notNull().default("available"),
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
	};
});

export const ordersRelations = relations(orders, ({ many, one }) => ({
	orderItems: many(orderItems),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id],
	}),
}));

export const orderItems = pgTable(
	"order_items",
	(d) => {
		return {
			orderId: d
				.text("order_id")
				.notNull()
				.references(() => orders.id),
			dessertId: d
				.integer("dessert_id")
				.notNull()
				.references(() => desserts.id),
			quantity: d.integer("quantity").notNull(),
			price: d.numeric("price", { precision: 10, scale: 2 }).notNull(),
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
