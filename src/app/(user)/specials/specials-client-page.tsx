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
import { ErrorState, getToastErrorMessage } from "@/components/ui/error-state";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCart } from "@/lib/cart-context";
import type { Dessert, SpecialsSettings } from "@/lib/db/schema";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const fetchSpecials = async () => {
	const { data } = await axios.get<Dessert[]>("/api/desserts?category=special");
	return data;
};

const fetchSpecialsSettings = async () => {
	const { data } = await axios.get("/api/specials-settings");
	return data.settings as SpecialsSettings;
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

	const {
		data: specials,
		isError: isSpecialsError,
		error: specialsError,
		refetch: refetchSpecials,
		isRefetching: isRefetchingSpecials,
	} = useQuery({
		queryKey: ["specials"],
		queryFn: fetchSpecials,
		initialData: initialSpecials,
		retry: 2,
	});

	const { data: settings } = useQuery({
		queryKey: ["specials-settings"],
		queryFn: fetchSpecialsSettings,
		initialData: initialSettings,
		retry: 2,
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

		try {
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
		} catch (error) {
			toast.error(getToastErrorMessage(error, "add-to-cart"));
		}
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
						<div className="mb-6 p-4 bg-purple-50/50 border border-purple-100 rounded-xl relative overflow-hidden">
							<div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
								<Sparkles className="w-16 h-16" />
							</div>
							<p className="text-purple-900/80 text-center font-medium leading-relaxed relative z-10 text-sm sm:text-base">
								{settings.description}
							</p>
						</div>
					)}

					{settings && (
						<Card className="mb-6 lg:mb-8 border-dashed shadow-sm">
							<CardHeader className="pb-3 border-b bg-muted/20">
								<CardTitle className="flex items-center gap-2 text-base sm:text-lg text-primary/90">
									<CalendarDays className="h-5 w-5" />
									Pickup Information
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-4">
								<div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
									<div className="flex flex-col gap-1.5 flex-1 p-3 bg-muted/30 rounded-lg border">
										<div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
											<CalendarDays className="h-3.5 w-3.5" />
											<span>Pickup Dates</span>
										</div>
										<p className="font-semibold text-[15px]">
											{formatDate(new Date(settings.pickupStartDate))} -{" "}
											{formatDate(new Date(settings.pickupEndDate))}
										</p>
									</div>
									<div className="flex flex-col gap-1.5 flex-1 p-3 bg-muted/30 rounded-lg border">
										<div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
											<Clock className="h-3.5 w-3.5" />
											<span>Pickup Time</span>
										</div>
										<p className="font-semibold text-[15px]">
											{settings.pickupStartTime} - {settings.pickupEndTime}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Egg Filter */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
							<span className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px] mb-1 sm:mb-0">
								Filter
							</span>
							<ToggleGroup
								type="single"
								value={eggFilter}
								onValueChange={setEggFilter}
								className="justify-start w-full sm:w-auto border rounded-md p-1 bg-muted/20"
							>
								<ToggleGroupItem
									value="all"
									aria-label="Show all specials"
									className="flex-1 sm:flex-initial text-xs h-8"
								>
									All
								</ToggleGroupItem>
								<ToggleGroupItem
									value="eggless"
									aria-label="Show eggless specials only"
									className="flex-1 sm:flex-initial text-xs h-8 gap-1.5"
								>
									<EggOff className="h-3.5 w-3.5" />
									Eggless
								</ToggleGroupItem>
								<ToggleGroupItem
									value="contains-egg"
									aria-label="Show specials containing egg"
									className="flex-1 sm:flex-initial text-xs h-8 gap-1.5"
								>
									<Egg className="h-3.5 w-3.5" />
									Contains Egg
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
						<p className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full whitespace-nowrap self-end sm:self-auto">
							{availableSpecials.length}{" "}
							{availableSpecials.length === 1 ? "special" : "specials"}
						</p>
					</div>
				</div>

				{isSpecialsError && !specials?.length ? (
					<ErrorState
						title="Couldn't Load Specials"
						message="We had trouble loading the specials menu. This is usually temporary."
						isNetworkError={
							specialsError instanceof Error &&
							specialsError.message === "Network Error"
						}
						onRetry={() => refetchSpecials()}
						isRetrying={isRefetchingSpecials}
						action={{
							label: "Back to Home",
							onClick: () => router.push("/"),
							variant: "ghost",
						}}
						size="lg"
					/>
				) : availableSpecials.length === 0 ? (
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
