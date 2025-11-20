"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { Calendar, MapPin, Monitor, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MyWorkshopOrder } from "@/lib/db/workshop-order";
import { formatCurrency } from "@/lib/utils";

const fetchMyWorkshops = async (): Promise<MyWorkshopOrder[]> => {
	const { data } = await axios.get("/api/workshop-orders");
	return data.data;
};

const getStatusColor = (status: string) => {
	switch (status) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "payment_pending":
			return "bg-orange-100 text-orange-800 border-orange-200";
		case "paid":
		case "confirmed":
			return "bg-green-100 text-green-800 border-green-200";
		case "cancelled":
			return "bg-red-100 text-red-800 border-red-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

const formatStatus = (status: string) => {
	return status
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export default function MyWorkshopPage({
	initialData,
}: {
	initialData: MyWorkshopOrder[];
}) {
	const searchParams = useSearchParams();
	const workshopId = searchParams.get("workshopId");
	const newOrder = searchParams.get("newOrder") === "true";

	const { data: workshopOrders = [] } = useQuery({
		queryKey: ["my-workshops"],
		queryFn: fetchMyWorkshops,
		initialData,
	});

	useEffect(() => {
		if (newOrder && workshopId) {
			// Make the spread and particle count dynamic based on the screen size
			const screenWidth = window.innerWidth;
			const particleCount = screenWidth > 768 ? 200 : 100;
			const spread = screenWidth > 768 ? 150 : 70;

			confetti({
				particleCount: particleCount,
				spread: spread,
				origin: { y: 0.3 },
				colors: ["#551303", "#8B5A2B", "#D2B48C", "#F4E4BC"], // Brown theme colors
			});
		}
	}, [newOrder, workshopId]);

	return (
		<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 min-h-[calc(100svh-11rem)]">
			<h1 className="text-2xl sm:text-3xl font-bold mb-6">My Workshops</h1>

			{workshopOrders.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center">
						<h3 className="text-lg font-semibold mb-2">
							No workshop registrations yet
						</h3>
						<p className="text-muted-foreground mb-4">
							You haven't registered for any workshops yet.
						</p>
						<a
							href="/workshops"
							className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
						>
							Browse Workshops
						</a>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{workshopOrders.map((order) => (
						<Card key={order.id} className="h-full flex flex-col">
							<CardHeader>
								<div className="flex justify-between items-start gap-2 mb-2">
									<CardTitle className="text-lg leading-tight">
										{order.workshop.title}
									</CardTitle>
									<Badge
										variant={
											order.workshop.type === "online" ? "default" : "secondary"
										}
									>
										{order.workshop.type === "online" ? (
											<Monitor className="w-3 h-3 mr-1" />
										) : (
											<MapPin className="w-3 h-3 mr-1" />
										)}
										{order.workshop.type}
									</Badge>
								</div>
								<div className="flex items-center gap-2">
									<Badge className={getStatusColor(order.status)}>
										{formatStatus(order.status)}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col">
								<p className="text-muted-foreground mb-4 flex-1 text-sm">
									{order.workshop.description}
								</p>

								<div className="space-y-3 mt-auto">
									<div className="flex justify-between items-center font-semibold text-lg">
										<span>Amount Paid:</span>
										<span>{formatCurrency(Number(order.amount))}</span>
									</div>

									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Users className="w-4 h-4" />
										<span>
											{order.slots || 1} slot{(order.slots || 1) > 1 ? "s" : ""}{" "}
											booked
										</span>
									</div>

									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Calendar className="w-4 h-4" />
										<span>
											Registered on{" "}
											{format(new Date(order.createdAt), "MMM d, yyyy")}
										</span>
									</div>

									{order.notes && (
										<div className="bg-muted/50 p-3 rounded-md">
											<h4 className="text-sm font-medium mb-1">Notes:</h4>
											<p className="text-sm text-muted-foreground">
												{order.notes}
											</p>
										</div>
									)}

									{order.status === "paid" || order.status === "confirmed" ? (
										<div className="bg-green-50 border border-green-200 p-3 rounded-md">
											<p className="text-sm text-green-700 font-medium">
												✓ Registration Confirmed
											</p>
											<p className="text-xs text-green-600 mt-1">
												You'll receive workshop details via WhatsApp soon.
											</p>
										</div>
									) : order.status === "payment_pending" ? (
										<div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
											<p className="text-sm text-orange-700 font-medium">
												⏳ Payment Pending
											</p>
											<p className="text-xs text-orange-600 mt-1">
												Please complete your payment to confirm registration.
											</p>
										</div>
									) : null}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
