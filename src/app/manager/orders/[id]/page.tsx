import { eq } from "drizzle-orm";
import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import ManagerNavButton from "./manager-nav-button";
import ManagerOrderDetailsClient from "./manager-order-details-client";

export default async function ManagerOrderDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const order = await db.query.orders.findFirst({
		where: eq(orders.id, id),
		columns: {
			id: true,
			createdAt: true,
			orderType: true,
			status: true,
			paymentStatus: true,
			razorpayPaymentId: true,
			pickupDateTime: true,
			notes: true,
		},
		with: {
			orderItems: {
				columns: {
					quantity: true,
					itemType: true,
				},
				with: {
					postalCombo: {
						columns: {
							name: true,
						},
					},
					dessert: {
						columns: {
							name: true,
							category: true,
						},
					},
				},
			},
			user: {
				columns: {
					id: true,
					name: true,
					email: true,
					phone: true,
					phoneVerified: true,
				},
			},
		},
	});

	if (!order) {
		return (
			<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
				<div className="max-w-6xl mx-auto">
					<Card>
						<CardContent className="py-8 text-center">
							<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
							<h2 className="text-xl font-bold mb-2">Order Not Found</h2>
							<p className="text-muted-foreground mb-6">
								{
									"The order you're looking for doesn't exist or has been removed."
								}
							</p>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<ManagerNavButton />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return <ManagerOrderDetailsClient order={order} />;
}
