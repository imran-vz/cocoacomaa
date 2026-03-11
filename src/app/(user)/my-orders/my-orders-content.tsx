"use client";

import {
	CalendarDays,
	Clock,
	EyeIcon,
	LinkIcon,
	MapPin,
	Package,
} from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import type { Dessert, Order, OrderItem } from "@/lib/db/schema";
import {
	formatDateTime,
	formatLocalDate,
	formatLocalTime,
} from "@/lib/format-timestamp";
import { formatCurrency } from "@/lib/utils";

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
}

export function MyOrdersContent({ userOrders }: MyOrdersContentProps) {
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
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
						{userOrders.map((order) => {
							const orderType = order.orderType as string;
							const isSpecial = orderType === "specials";
							const isPostal = orderType === "postal-brownies";
							const isWorkshop = orderType === "workshop";

							return (
								<Card
									key={order.id}
									className="flex flex-col h-full hover:shadow-md transition-shadow"
								>
									<CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
										<div className="flex flex-col gap-1">
											<Link
												href={`/order/${order.id}`}
												className="font-mono text-sm font-medium hover:underline flex items-center gap-1.5 text-primary"
											>
												#{order.id.slice(-8).toUpperCase()}
												<LinkIcon className="h-3 w-3" />
											</Link>
											<span className="text-xs text-muted-foreground flex items-center gap-1.5">
												<CalendarDays className="h-3.5 w-3.5" />
												{formatDateTime(order.createdAt)}
											</span>
										</div>
										<div className="flex flex-col items-end gap-1.5">
											<Badge
												variant={
													order.status === "paid" ? "default" : "secondary"
												}
												className="capitalize text-xs"
											>
												{order.status.replace(/_/g, " ")}
											</Badge>
											{orderType && orderType !== "cake-orders" && (
												<Badge
													variant="outline"
													className={`text-[10px] px-1.5 py-0 items-center justify-center font-semibold uppercase tracking-wider ${
														isSpecial
															? "bg-purple-50 text-purple-700 border-purple-200"
															: isPostal
																? "bg-amber-50 text-amber-700 border-amber-200"
																: isWorkshop
																	? "bg-blue-50 text-blue-700 border-blue-200"
																	: ""
													}`}
												>
													{orderType.replace("-", " ")}
												</Badge>
											)}
										</div>
									</CardHeader>

									<CardContent className="py-4 flex-1 flex flex-col justify-between">
										<div>
											<div className="flex items-start justify-between mb-4">
												<div>
													<p className="text-sm font-semibold text-muted-foreground mb-1">
														Total
													</p>
													<p className="font-bold text-lg">
														{formatCurrency(Number(order.total))}
													</p>
												</div>
												<div className="text-right">
													<p className="text-sm font-semibold text-muted-foreground mb-1">
														Items
													</p>
													<p className="font-medium">
														{order.orderItems.length} items
													</p>
												</div>
											</div>
										</div>

										<div className="mt-2 pt-4 border-t border-dashed">
											<div className="flex items-start gap-3">
												<div className="mt-0.5 p-1.5 bg-muted rounded-md shrink-0">
													{isPostal ? (
														<Package className="h-4 w-4 text-primary" />
													) : (
														<MapPin className="h-4 w-4 text-primary" />
													)}
												</div>
												<div>
													<p className="text-sm font-semibold mb-0.5">
														{isPostal
															? "Delivery"
															: isWorkshop
																? "Workshop Details"
																: "Pickup Information"}
													</p>

													{isPostal ? (
														<p className="text-xs text-muted-foreground leading-relaxed">
															Postal brownie delivery. Check order details for
															tracking status.
														</p>
													) : order.pickupDateTime ? (
														<div className="flex flex-col gap-0.5 mt-1">
															<span
																className={`text-sm ${isSpecial ? "text-purple-700 font-medium" : ""}`}
															>
																{formatLocalDate(order.pickupDateTime)}
															</span>
															<span
																className={`text-xs flex items-center gap-1 ${isSpecial ? "text-purple-600" : "text-muted-foreground"}`}
															>
																<Clock className="h-3 w-3" />
																{formatLocalTime(order.pickupDateTime)}
															</span>
														</div>
													) : (
														<p className="text-xs text-muted-foreground">
															Date pending confirmation
														</p>
													)}
												</div>
											</div>
										</div>
									</CardContent>

									<CardFooter className="pt-0 pb-4 px-4 border-t bg-muted/10">
										<Button
											variant="outline"
											asChild
											className="w-full mt-4 bg-background"
										>
											<Link href={`/order/${order.id}`}>
												<EyeIcon className="w-4 h-4 mr-2" /> View Order Details
											</Link>
										</Button>
									</CardFooter>
								</Card>
							);
						})}
					</div>
				</FadeIn>
			)}
		</div>
	);
}
