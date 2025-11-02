"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";
import { DataTable } from "@/components/ui/data-table";
import type { Dessert, Order, OrderItem } from "@/lib/db/schema";

type UserOrder = Pick<
	Order,
	"id" | "createdAt" | "total" | "status" | "pickupDateTime" | "orderType"
> & {
	orderItems: Array<
		Pick<OrderItem, "itemType"> & {
			dessert: Pick<Dessert, "category"> | null;
		}
	>;
};

interface MyOrdersContentProps {
	userOrders: UserOrder[];
	columns: ColumnDef<UserOrder>[];
}

export function MyOrdersContent({ userOrders, columns }: MyOrdersContentProps) {
	return (
		<div className="container mx-auto py-8 px-4 min-h-[calc(100svh-11rem)]">
			<FadeIn>
				<h1 className="text-2xl md:text-3xl font-bold mb-6">My Orders</h1>
			</FadeIn>
			{userOrders.length === 0 ? (
				<FadeIn delay={0.1}>
					<div className="text-center text-muted-foreground py-12">
						<p className="text-lg">You haven't placed any orders yet.</p>
						<div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
							<Link href="/order" className="text-primary underline">
								Browse Desserts
							</Link>
							<span className="hidden sm:inline">•</span>
							<Link href="/specials" className="text-primary underline">
								Check Specials
							</Link>
						</div>
					</div>
				</FadeIn>
			) : (
				<FadeIn delay={0.1}>
					<DataTable columns={columns} data={userOrders} />
				</FadeIn>
			)}
		</div>
	);
}
