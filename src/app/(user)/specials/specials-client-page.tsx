"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
	CalendarDays,
	Clock,
	Egg,
	EggOff,
	Minus,
	Plus,
	ShoppingCart,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCart } from "@/lib/cart-context";
import type { Dessert, SpecialsSettings } from "@/lib/db/schema";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const fetchSpecials = async () => {
	try {
		const { data } = await axios.get<Dessert[]>(
			"/api/desserts?category=special",
		);
		return data;
	} catch (error) {
		console.error("Error fetching specials:", error);
		toast.error("Failed to load specials");
		return [];
	}
};

const fetchSpecialsSettings = async () => {
	try {
		const { data } = await axios.get("/api/specials-settings");
		return data.settings as SpecialsSettings;
	} catch (error) {
		console.error("Error fetching specials settings:", error);
		return null;
	}
};

export default function SpecialsClientPage({
	initialSpecials,
	initialSettings,
	isAuthenticated,
}: {
	initialSpecials: Dessert[];
	initialSettings?: SpecialsSettings | null;
	isAuthenticated: boolean;
}) {
	const router = useRouter();
	const { items, addItem, removeItem, updateQuantity, clearNonSpecials } =
		useCart();
	const [eggFilter, setEggFilter] = useState<
		("all" | "eggless" | "contains-egg") | (string & {})
	>("all");

	const { data: specials } = useQuery({
		queryKey: ["specials"],
		queryFn: fetchSpecials,
		initialData: initialSpecials,
	});

	const { data: settings } = useQuery({
		queryKey: ["specials-settings"],
		queryFn: fetchSpecialsSettings,
		initialData: initialSettings,
	});

	// If specials are not active, show message
	if (!settings?.isActive) {
		return (
			<div className="container mx-auto p-4 sm:p-6">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-3xl font-bold mb-6">Specials</h1>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Sparkles />
							</EmptyMedia>
							<EmptyTitle>Specials Not Available</EmptyTitle>
							<EmptyDescription>
								Specials are currently not available. Please check back later!
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</div>
			</div>
		);
	}

	const handleAddToCart = (special: Dessert) => {
		if (!isAuthenticated) {
			router.push("/login?redirect=/specials");
			return;
		}

		// Clear non-special items from cart before adding special
		clearNonSpecials();

		addItem({
			id: special.id,
			name: special.name,
			price: Number(special.price),
			quantity: 1,
			type: "cake-orders",
			category: "special",
		});
	};

	const getItemQuantity = (specialId: number) => {
		const item = items.find((item) => item.id === specialId);
		return item?.quantity || 0;
	};

	const handleQuantityChange = (specialId: number, newQuantity: number) => {
		if (newQuantity <= 0) {
			removeItem(specialId);
		} else {
			updateQuantity(specialId, newQuantity);
		}
	};

	const availableSpecials =
		specials?.filter((special) => {
			// Then filter by egg content based on selected filter
			if (eggFilter === "eggless" && special.containsEgg) return false;
			if (eggFilter === "contains-egg" && !special.containsEgg) return false;

			return true;
		}) || [];

	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-4">Specials</h1>

					{/* Specials Description */}
					{settings?.description && (
						<div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
							<p className="text-purple-800 text-center font-medium">
								{settings.description}
							</p>
						</div>
					)}

					{settings && (
						<Card className="mb-6">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CalendarDays className="h-5 w-5" />
									Pickup Information
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<CalendarDays className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">Pickup Dates:</span>
										<Badge variant="outline">
											{formatDate(new Date(settings.pickupStartDate))} -{" "}
											{formatDate(new Date(settings.pickupEndDate))}
										</Badge>
									</div>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">Pickup Time:</span>
										<Badge variant="outline">
											{settings.pickupStartTime} - {settings.pickupEndTime}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Egg Filter */}
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-muted-foreground">
								Filter by:
							</span>
							<ToggleGroup
								type="single"
								value={eggFilter}
								onValueChange={setEggFilter}
								className="justify-start"
							>
								<ToggleGroupItem value="all" aria-label="Show all specials">
									<span className="text-xs whitespace-nowrap text-nowrap">
										All Specials
									</span>
								</ToggleGroupItem>
								<ToggleGroupItem
									value="eggless"
									aria-label="Show eggless specials only"
								>
									<EggOff className="h-4 w-4 mr-1" />
									<span className="text-xs whitespace-nowrap text-nowrap">
										Eggless
									</span>
								</ToggleGroupItem>
								<ToggleGroupItem
									value="contains-egg"
									aria-label="Show specials containing egg"
								>
									<Egg className="h-4 w-4 mr-1" />
									<span className="text-xs whitespace-nowrap text-nowrap">
										Contains Egg
									</span>
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
						<p className="text-sm text-muted-foreground">
							Showing {availableSpecials.length}{" "}
							{availableSpecials.length === 1 ? "special" : "specials"}
						</p>
					</div>
				</div>

				{availableSpecials.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Sparkles />
							</EmptyMedia>
							<EmptyTitle>No Specials Found</EmptyTitle>
							<EmptyDescription>
								{eggFilter !== "all"
									? `No ${eggFilter === "eggless" ? "eggless" : "egg-containing"} specials are currently available. Try changing your filter or check back later!`
									: "There are currently no specials available. Please check back later!"}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{availableSpecials.map((special) => {
							const quantity = getItemQuantity(special.id);
							const eggBadgeVariant = special.containsEgg
								? "destructive"
								: "success";
							const eggBadgeLabel = special.containsEgg
								? "Contains Egg"
								: "Eggless";
							const EggIcon = special.containsEgg ? Egg : EggOff;

							return (
								<Card
									key={special.id}
									className={cn(
										"overflow-hidden group hover:shadow-lg transition-shadow ",
										special.imageUrl ? "pt-0" : "",
									)}
								>
									{special.imageUrl && (
										<div className="relative h-48 overflow-hidden">
											<Image
												src={special.imageUrl}
												alt={special.name}
												fill
												className="object-cover group-hover:scale-105 transition-transform duration-300"
											/>
										</div>
									)}
									<CardHeader>
										<div className="flex items-start justify-between gap-3 flex-col">
											<CardTitle className="text-lg">{special.name}</CardTitle>
											<div className="flex flex-wrap gap-2">
												<Badge variant={eggBadgeVariant} className="gap-1">
													<EggIcon className="h-3 w-3" />
													{eggBadgeLabel}
												</Badge>
											</div>
										</div>
									</CardHeader>
									<CardContent className="gap-y-4 flex flex-col flex-1">
										{special.description && (
											<p className="text-sm text-muted-foreground flex-1">
												{special.description}
											</p>
										)}

										<div className="flex justify-between items-center">
											<span className="text-2xl font-bold text-primary">
												{formatCurrency(Number(special.price))}
											</span>
										</div>

										<div className="flex items-center gap-2">
											{quantity > 0 ? (
												<div className="flex items-center gap-2 flex-1">
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															handleQuantityChange(special.id, quantity - 1)
														}
													>
														<Minus className="h-4 w-4" />
													</Button>
													<span className="font-medium min-w-8 text-center">
														{quantity}
													</span>
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															handleQuantityChange(special.id, quantity + 1)
														}
													>
														<Plus className="h-4 w-4" />
													</Button>
												</div>
											) : (
												<Button
													onClick={() => handleAddToCart(special)}
													className="flex-1"
												>
													<ShoppingCart className="mr-2 h-4 w-4" />
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
	);
}
