import type { Order } from "@/lib/db/schema";

export const ORDER_STATUSES: { label: string; value: Order["status"] }[] = [
	{ label: "Pending", value: "pending" },
	{ label: "Paid", value: "paid" },
	{ label: "Confirmed", value: "confirmed" },
	{ label: "Preparing", value: "preparing" },
	{ label: "Ready", value: "ready" },
	{ label: "Completed", value: "completed" },
	{ label: "Cancelled", value: "cancelled" },
	{ label: "Dispatched", value: "dispatched" },
];

export const ORDER_TYPES: { label: string; value: Order["orderType"] }[] = [
	{ label: "Cake Orders", value: "cake-orders" },
	{ label: "Postal Brownies", value: "postal-brownies" },
	{ label: "Specials", value: "specials" },
];
