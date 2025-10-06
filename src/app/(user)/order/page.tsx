"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Egg, EggOff, Minus, Plus, ShoppingCart } from "lucide-react";
import lazyLoading from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderRestrictionBanner from "@/components/ui/order-restriction-banner";
import { useCakeOrderSettings } from "@/hooks/use-order-settings";
import { useCart } from "@/lib/cart-context";
import { cn, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Dessert {
	id: number;
	name: string;
	price: number;
	description: string | null;
	imageUrl: string | null;
	category: "cake" | "dessert" | "special";
	leadTimeDays: number;
	enabled: boolean;
	containsEgg: boolean;
}

const LoginModal = lazyLoading(() => import("@/components/login-modal"), {
	ssr: false,
});

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

export default function OrderPage() {
	const router = useRouter();
	const { items, addItem, removeItem, updateQuantity, total } = useCart();
	const { data: session, status } = useSession();
	const [selectedCategory, setSelectedCategory] = useState<
		"all" | "cake" | "dessert"
	>("all");
	const { areOrdersAllowed: ordersAllowed, settings } = useCakeOrderSettings();

	const { data: desserts, isLoading } = useQuery({
		queryKey: ["desserts"],
		queryFn: () => fetchDesserts(),
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

	const handleCheckout = () => {
		if (!ordersAllowed) {
			const isSystemDisabled = !settings?.isActive;

			if (isSystemDisabled) {
				toast.error("Cake order system is currently disabled");
			} else {
				toast.error("Cake orders are only accepted on allowed days");
			}
			return;
		}

		router.push("/checkout");
	};

	if (isLoading || status === "loading") {
		return (
			<div className="container min-h-[calc(100svh-10rem)] mx-auto py-4 sm:py-6 lg:py-8 px-4">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
					<div className="lg:col-span-2">
						<div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-200 rounded animate-pulse mb-4 sm:mb-6 lg:mb-8" />
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
							{Array.from({ length: 4 }, (_, i) => (
								<Card key={`loading-dessert-${i}-${Date.now()}`}>
									<CardHeader className="pb-3 sm:pb-4">
										<div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded animate-pulse" />
									</CardHeader>
									<CardContent className="pt-0">
										<div className="space-y-3 sm:space-y-4">
											<div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
											<div className="h-3 sm:h-4 w-16 sm:w-24 bg-gray-200 rounded animate-pulse" />
											<div className="h-8 sm:h-10 bg-gray-200 rounded animate-pulse" />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
					<div className="lg:col-span-1">
						<Card>
							<CardHeader className="pb-3 sm:pb-4">
								<div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded animate-pulse" />
							</CardHeader>
							<CardContent className="pt-0">
								<div className="h-32 sm:h-40 lg:h-64 bg-gray-200 rounded animate-pulse" />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	// Show login modal if not authenticated
	if (!session) {
		return (
			<div className="container mx-auto p-4 sm:p-6">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-3xl font-bold mb-6">Specials</h1>
					<Alert>
						<AlertTitle>Authentication Required</AlertTitle>
						<AlertDescription>
							Please sign in to access our specials.
						</AlertDescription>
					</Alert>
				</div>
				<LoginModal open={true} onClose={() => {}} redirect="/order" />
			</div>
		);
	}

	return (
		<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
			<h1 className="text-2xl sm:text-3xl sm:hidden font-bold mb-4 sm:mb-6 lg:mb-8">
				Our Desserts
			</h1>

			{/* Show order restriction banner for mobile view */}
			{!ordersAllowed && (
				<div className="sm:hidden">
					<OrderRestrictionBanner />
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
				<div className="order-1 lg:order-2 lg:col-span-1">
					<div className="h-0 lg:h-[66px]" />
					<Card className="lg:sticky lg:top-20">
						<CardHeader className="pb-3 sm:pb-4">
							<CardTitle className="flex items-center text-lg sm:text-xl">
								<ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
								Your Cart
							</CardTitle>
						</CardHeader>

						<CardContent className="pt-0">
							{items.length === 0 ? (
								<p className="text-muted-foreground text-center py-6 sm:py-8 text-sm sm:text-base">
									Your cart is empty
								</p>
							) : (
								<div className="space-y-3 sm:space-y-4">
									{items.map((item) => (
										<div
											key={item.id}
											className="flex justify-between items-start gap-2"
										>
											<div className="flex-1 min-w-0">
												<h4 className="font-medium text-sm sm:text-base leading-tight">
													{item.name}
												</h4>
												<p className="text-xs sm:text-sm text-muted-foreground">
													{formatCurrency(Number(item.price))} x {item.quantity}
												</p>
											</div>
											<div className="flex items-center space-x-1 shrink-0">
												<Button
													variant="outline"
													size="icon"
													className="h-6 w-6 sm:h-8 sm:w-8"
													onClick={() =>
														handleQuantityChange(item.id, item.quantity - 1)
													}
												>
													<Minus className="h-2 w-2 sm:h-3 sm:w-3" />
												</Button>
												<span className="w-4 sm:w-6 text-center text-xs sm:text-sm font-medium">
													{item.quantity}
												</span>
												<Button
													variant="outline"
													size="icon"
													className="h-6 w-6 sm:h-8 sm:w-8"
													onClick={() =>
														handleQuantityChange(item.id, item.quantity + 1)
													}
												>
													<Plus className="h-2 w-2 sm:h-3 sm:w-3" />
												</Button>
											</div>
										</div>
									))}

									<div className="border-t pt-3 sm:pt-4 space-y-3 sm:space-y-4">
										<div className="flex justify-between items-center font-medium text-base sm:text-lg">
											<span>Total:</span>
											<span>{formatCurrency(Number(total))}</span>
										</div>

										<Button
											className="w-full"
											size="lg"
											onClick={handleCheckout}
											disabled={!ordersAllowed}
											variant={!ordersAllowed ? "secondary" : "default"}
										>
											{!ordersAllowed
												? "Cake Orders Unavailable"
												: "Proceed to Checkout"}
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Dessert List - show second on mobile, left on desktop */}
				<div className="order-2 lg:order-1 lg:col-span-2">
					<h1 className="text-2xl hidden sm:block sm:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">
						Our Desserts
					</h1>

					{/* Category Filter */}
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

					{/* Show order restriction banner for desktop view */}
					{!ordersAllowed && (
						<div className="hidden sm:block">
							<OrderRestrictionBanner />
						</div>
					)}

					{filteredDesserts?.length === 0 ? (
						<Card>
							<CardContent className="py-6 sm:py-8 text-center">
								<p className="text-muted-foreground text-sm sm:text-base">
									{selectedCategory === "all"
										? "No desserts available at the moment."
										: `No ${selectedCategory === "cake" ? "cakes" : "desserts"} available at the moment.`}
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
							{filteredDesserts?.map((dessert) => {
								const quantity = getItemQuantity(dessert.id);
								const eggBadgeVariant = dessert.containsEgg
									? "destructive"
									: "success";
								return (
									<Card
										key={dessert.id}
										className={cn(
											"overflow-hidden flex flex-col justify-between ",
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
												<CardTitle className="text-lg sm:text-xl leading-tight">
													{dessert.name}
												</CardTitle>
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
														dessert.category === "cake" ? "default" : "outline"
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
																className="h-8 w-8 sm:h-9 sm:w-9"
																onClick={() =>
																	handleQuantityChange(dessert.id, quantity - 1)
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
																className="h-8 w-8 sm:h-9 sm:w-9"
																onClick={() =>
																	handleQuantityChange(dessert.id, quantity + 1)
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
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
