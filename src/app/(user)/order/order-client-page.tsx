"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
	CakeSlice,
	Egg,
	EggOff,
	Minus,
	Plus,
	ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { FadeIn } from "@/components/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/stagger-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import OrderRestrictionBanner from "@/components/ui/order-restriction-banner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCakeOrderSettings } from "@/hooks/use-order-settings";
import { useCart } from "@/lib/cart-context";
import type { Dessert } from "@/lib/db/schema";
import { cn, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const fetchDesserts = async () => {
	try {
		const { data } = await axios.get<Dessert[]>("/api/desserts");
		return data;
	} catch (error) {
		console.error("Error fetching desserts:", error);
		toast.error("Failed to load desserts");
	} finally {
	}
};

export default function OrderClientPage({
	initialDesserts,
	isAuthenticated,
}: {
	initialDesserts: Dessert[];
	isAuthenticated: boolean;
}) {
	const router = useRouter();
	const { items, addItem, removeItem, updateQuantity } = useCart();
	const [selectedCategory, setSelectedCategory] = useState<
		"all" | "cake" | "dessert"
	>("all");
	const { areOrdersAllowed: ordersAllowed } = useCakeOrderSettings();

	const { data: desserts } = useQuery({
		queryKey: ["desserts"],
		queryFn: fetchDesserts,
		initialData: initialDesserts,
	});

	// Filter desserts by category and sort by price (lowest to highest)
	const filteredDesserts = useMemo(() => {
		if (!desserts) return [];
		const filtered =
			selectedCategory === "all"
				? desserts
				: desserts.filter((dessert) => dessert.category === selectedCategory);
		return filtered.sort((a, b) => Number(a.price) - Number(b.price));
	}, [desserts, selectedCategory]);

	useEffect(() => {
		// remove any postal combos from the cart
		for (const item of items) {
			if (item.type === "postal-brownies") {
				removeItem(item.id);
			}
		}
	}, [items, removeItem]);

	const handleAddToCart = (dessert: Dessert) => {
		if (!isAuthenticated) {
			router.push("/login?redirect=/order");
			return;
		}
		addItem({
			id: dessert.id,
			name: dessert.name,
			price: Number(dessert.price),
			quantity: 1,
			type: "cake-orders",
			category: dessert.category,
		});
	};

	const getItemQuantity = (dessertId: number) => {
		const item = items.find((item) => item.id === dessertId);
		return item?.quantity || 0;
	};

	const handleQuantityChange = (dessertId: number, newQuantity: number) => {
		if (newQuantity <= 0) {
			removeItem(dessertId);
		} else {
			updateQuantity(dessertId, newQuantity);
		}
	};

	return (
		<TooltipProvider>
			<div className="container min-h-[calc(100svh-11rem)] mx-auto py-4 sm:py-6 lg:py-8 px-4">
				<div className="max-w-6xl mx-auto">
					<FadeIn>
						<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">
							Our Desserts
						</h1>
					</FadeIn>

					{/* Category Filter */}
					<FadeIn delay={0.1}>
						<div className="flex gap-2 mb-4 sm:mb-6">
							<Button
								variant={selectedCategory === "all" ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedCategory("all")}
							>
								All
							</Button>
							<Button
								variant={selectedCategory === "cake" ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedCategory("cake")}
							>
								Cakes
							</Button>
							<Button
								variant={selectedCategory === "dessert" ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedCategory("dessert")}
							>
								Desserts
							</Button>
						</div>
					</FadeIn>

					{/* Show order restriction banner */}
					{!ordersAllowed && <OrderRestrictionBanner />}

					{filteredDesserts?.length === 0 ? (
						<FadeIn delay={0.2}>
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<CakeSlice />
									</EmptyMedia>
									<EmptyTitle>
										{selectedCategory === "all"
											? "No Desserts Available"
											: `No ${selectedCategory === "cake" ? "Cakes" : "Desserts"} Available`}
									</EmptyTitle>
									<EmptyDescription>
										{selectedCategory === "all"
											? "No desserts available at the moment. Check back soon!"
											: `No ${selectedCategory === "cake" ? "cakes" : "desserts"} available right now. Try browsing other categories!`}
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						</FadeIn>
					) : (
						<>
							<StaggerContainer
								key={selectedCategory}
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
							>
								{filteredDesserts?.map((dessert) => {
									const quantity = getItemQuantity(dessert.id);
									const eggBadgeVariant = dessert.containsEgg
										? "destructive"
										: "success";
									return (
										<StaggerItem key={dessert.id}>
											<Card
												className={cn(
													"overflow-hidden flex flex-col justify-between h-full",
													dessert.imageUrl ? "pt-0" : "",
												)}
											>
												{dessert.imageUrl && (
													<div className="relative aspect-video w-full">
														<Image
															src={dessert.imageUrl}
															alt={dessert.name}
															fill
															className="object-cover"
															sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
														/>
													</div>
												)}
												<CardHeader className="pb-3 sm:pb-4 flex-1">
													<div className="flex justify-between items-start gap-2">
														<Tooltip>
															<TooltipTrigger asChild>
																<CardTitle className="text-lg sm:text-xl leading-tight truncate max-w-[200px]">
																	{dessert.name}
																</CardTitle>
															</TooltipTrigger>
															<TooltipContent>
																<p>{dessert.name}</p>
															</TooltipContent>
														</Tooltip>
														<Badge
															variant="secondary"
															className="shrink-0 text-xs sm:text-sm"
														>
															{formatCurrency(Number(dessert.price))}
														</Badge>
													</div>
													<div className="flex flex-wrap gap-2 mt-2">
														<Badge
															variant={
																dessert.category === "cake"
																	? "default"
																	: "outline"
															}
															className="text-xs"
														>
															{dessert.category === "cake" ? "Cake" : "Dessert"}
														</Badge>
														<Badge
															variant={eggBadgeVariant}
															className="text-xs gap-1"
														>
															{dessert.containsEgg ? (
																<>
																	<Egg className="h-3 w-3" />
																	Contains Egg
																</>
															) : (
																<>
																	<EggOff className="h-3 w-3" />
																	Eggless
																</>
															)}
														</Badge>
														<Badge variant="outline" className="text-xs">
															{dessert.leadTimeDays} day
															{dessert.leadTimeDays > 1 ? "s" : ""} lead time
														</Badge>
													</div>
												</CardHeader>
												<CardContent className="pt-0">
													<div className="space-y-3 sm:space-y-4">
														{dessert.description && (
															<p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
																{dessert.description}
															</p>
														)}

														{quantity > 0 ? (
															<div className="flex items-center justify-between gap-2">
																<div className="flex items-center space-x-1 sm:space-x-2">
																	<Button
																		variant="outline"
																		size="icon"
																		className="h-8 w-8"
																		onClick={() =>
																			handleQuantityChange(
																				dessert.id,
																				quantity - 1,
																			)
																		}
																	>
																		<Minus className="h-3 w-3 sm:h-4 sm:w-4" />
																	</Button>
																	<span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">
																		{quantity}
																	</span>
																	<Button
																		variant="outline"
																		size="icon"
																		className="h-8 w-8"
																		onClick={() =>
																			handleQuantityChange(
																				dessert.id,
																				quantity + 1,
																			)
																		}
																	>
																		<Plus className="h-3 w-3 sm:h-4 sm:w-4" />
																	</Button>
																</div>
																<Badge variant="success" className="text-xs">
																	In Cart
																</Badge>
															</div>
														) : (
															<Button
																onClick={() => handleAddToCart(dessert)}
																className="w-full text-sm sm:text-base"
																size="sm"
															>
																<Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
																Add to Cart
															</Button>
														)}
													</div>
												</CardContent>
											</Card>
										</StaggerItem>
									);
								})}
							</StaggerContainer>

							{items.length > 0 && (
								<FadeIn delay={0.3}>
									<div className="mt-8 flex justify-center">
										<Button
											size="lg"
											className="w-full sm:w-auto min-w-[280px]"
											onClick={() => {
												if (!ordersAllowed) {
													toast.error(
														"Cake orders are only accepted on allowed days",
													);
													return;
												}
												window.location.href = "/checkout";
											}}
											disabled={!ordersAllowed}
										>
											<ShoppingCart className="h-4 w-4 mr-2" />
											Proceed to Checkout
										</Button>
									</div>
								</FadeIn>
							)}
						</>
					)}
				</div>
			</div>
		</TooltipProvider>
	);
}
