import { auth } from "@/auth";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { columns } from "./columns";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login");
	}

	const userOrders = await db.query.orders.findMany({
		where: eq(orders.userId, session.user.id),
		orderBy: desc(orders.createdAt),
		columns: {
			id: true,
			total: true,
			status: true,
			createdAt: true,
			pickupDateTime: true,
		},
	});

	return (
		<div className="container mx-auto py-8 px-4 min-h-[calc(100svh-11rem)]">
			<h1 className="text-2xl md:text-3xl font-bold mb-6">My Orders</h1>
			{userOrders.length === 0 ? (
				<div className="text-center text-muted-foreground py-12">
					<p className="text-lg">You haven't placed any orders yet.</p>
					<Link
						href="/order"
						className="text-primary underline mt-4 inline-block"
					>
						Browse Desserts
					</Link>
				</div>
			) : (
				<Suspense
					fallback={
						<div>
							<Loader2 className="w-4 h-4 animate-spin" />
						</div>
					}
				>
					<DataTable columns={columns} data={userOrders} />
				</Suspense>
			)}
		</div>
	);
}
