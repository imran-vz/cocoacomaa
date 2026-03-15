"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Monitor, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MyWorkshopOrder } from "@/lib/db/workshop-order";
import { formatWorkshopDate, formatWorkshopTime } from "@/lib/format-timestamp";
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
		<div className="container mx-auto py-6 sm:py-8 px-4 min-h-[calc(100svh-11rem)]">
			<h1 className="text-2xl sm:text-3xl font-bold mb-6">My Workshops</h1>

			{workshopOrders.length === 0 ? (
				<Card className="border-dashed bg-muted/10">
					<CardContent className="py-12 flex flex-col items-center text-center">
						<div className="bg-muted p-4 rounded-full mb-4">
							<Monitor className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="text-xl font-semibold mb-2 text-foreground">
							No workshop registrations
						</h3>
						<p className="text-muted-foreground mb-6 max-w-sm">
							You haven't registered for any workshops yet. Discover our latest
							baking masterclasses!
						</p>
						<a
							href="/workshops"
							className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
						>
							Browse Workshops
						</a>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
					{workshopOrders.map((order) => (
						<Card
							key={order.id}
							className="h-full flex flex-col hover:shadow-md transition-shadow"
						>
							<CardHeader className="pb-4 border-b bg-muted/20">
								<div className="flex justify-between items-start gap-4 mb-3">
									<CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
										{order.workshop.title}
									</CardTitle>
									<Badge
										variant={
											order.workshop.type === "online" ? "default" : "secondary"
										}
										className="shrink-0"
									>
										{order.workshop.type === "online" ? (
											<Monitor className="w-3 h-3 mr-1" />
										) : (
											<MapPin className="w-3 h-3 mr-1" />
										)}
										<span className="capitalize">{order.workshop.type}</span>
									</Badge>
								</div>
								<div className="flex items-center gap-2">
									<Badge
										className={`${getStatusColor(order.status)} font-medium capitalize shadow-sm`}
									>
										{formatStatus(order.status)}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col pt-5">
								<p className="text-muted-foreground mb-6 flex-1 text-sm leading-relaxed line-clamp-3">
									{order.workshop.description}
								</p>

								<div className="space-y-4 mt-auto">
									<div className="bg-muted/30 rounded-lg p-4 space-y-3 border">
										<div className="flex justify-between items-center">
											<span className="font-semibold text-muted-foreground text-sm">
												Amount Paid
											</span>
											<span className="font-bold text-lg">
												{formatCurrency(Number(order.amount))}
											</span>
										</div>

										<div className="h-px bg-border w-full" />

										<div className="flex justify-between items-center text-sm">
											<div className="flex items-center gap-2 text-muted-foreground">
												<Users className="w-4 h-4 text-primary" />
												<span className="font-medium">Slots</span>
											</div>
											<span className="font-semibold">{order.slots || 1}</span>
										</div>

										{order.workshop.date && (
											<>
												<div className="flex justify-between items-center text-sm">
													<div className="flex items-center gap-2 text-muted-foreground">
														<Calendar className="w-4 h-4 text-primary" />
														<span className="font-medium">Workshop Date</span>
													</div>
													<span className="font-semibold text-right">
														{formatWorkshopDate(order.workshop.date)}
													</span>
												</div>
												{order.workshop.startTime && order.workshop.endTime && (
													<div className="flex justify-between items-center text-sm">
														<div className="flex items-center gap-2 text-muted-foreground">
															<Clock className="w-4 h-4 text-primary" />
															<span className="font-medium">Time</span>
														</div>
														<span className="font-semibold text-right">
															{formatWorkshopTime(order.workshop.startTime)} -{" "}
															{formatWorkshopTime(order.workshop.endTime)}
														</span>
													</div>
												)}
											</>
										)}

										<div className="flex justify-between items-center text-sm">
											<div className="flex items-center gap-2 text-muted-foreground">
												<Calendar className="w-4 h-4 text-primary" />
												<span className="font-medium">Registered</span>
											</div>
											<span className="font-semibold text-right">
												{format(new Date(order.createdAt), "MMM d, yyyy")}
											</span>
										</div>
									</div>

									{order.notes && (
										<div className="bg-muted/50 p-3 rounded-md border text-sm">
											<span className="font-semibold block mb-1">Notes:</span>
											<span className="text-muted-foreground">
												{order.notes}
											</span>
										</div>
									)}

									{order.status === "paid" || order.status === "confirmed" ? (
										<div className="bg-green-50 border border-green-200 p-3 rounded-md text-sm">
											<p className="text-green-800 font-semibold flex items-center gap-1.5">
												<span className="bg-green-200 text-green-800 rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px]">
													✓
												</span>
												Registration Confirmed
											</p>
											<p className="text-green-600/90 mt-1 leading-snug">
												You'll receive workshop details via WhatsApp soon.
											</p>
										</div>
									) : order.status === "payment_pending" ? (
										<div className="bg-orange-50 border border-orange-200 p-3 rounded-md text-sm flex flex-col items-center text-center">
											<p className="text-orange-800 font-semibold">
												Payment Pending
											</p>
											<p className="text-orange-600/90 mt-1 leading-snug mb-3">
												Complete your payment to confirm registration.
											</p>
											<Button
												asChild
												size="sm"
												className="w-full bg-orange-600 hover:bg-orange-700 text-white"
											>
												{/* Placeholder for real payment retry link if available */}
												<a href={`/order/${order.id}`}>Pay Now</a>
											</Button>
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
