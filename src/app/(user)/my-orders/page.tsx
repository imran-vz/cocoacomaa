import { and, desc, eq, isNotNull } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { Icons } from "@/components/icons";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { columns } from "./columns";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login");
	}

	const userOrders = await db.query.orders.findMany({
		where: and(
			eq(orders.userId, session.user.id),
			isNotNull(orders.razorpayPaymentId),
		),
		orderBy: desc(orders.createdAt),
		columns: {
			id: true,
			total: true,
			status: true,
			createdAt: true,
			pickupDateTime: true,
			orderType: true,
		},
		with: {
			orderItems: {
				columns: {
					itemType: true,
				},
				with: {
					dessert: {
						columns: {
							category: true,
						},
					},
				},
			},
		},
	});

	return (
		<div className="container mx-auto py-8 px-4 min-h-[calc(100svh-11rem)]">
			<h1 className="text-2xl md:text-3xl font-bold mb-6">My Orders</h1>
			{userOrders.length === 0 ? (
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
			) : (
				<Suspense
					fallback={
						<div>
							<Icons.spinner className="w-4 h-4 animate-spin" />
						</div>
					}
				>
					<DataTable columns={columns} data={userOrders} />
				</Suspense>
			)}
		</div>
	);
}
