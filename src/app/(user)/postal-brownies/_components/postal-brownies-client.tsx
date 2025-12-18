"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Egg, EggOff, Package } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePostalOrderSettings } from "@/hooks/use-postal-order-settings";
import { useCart } from "@/lib/cart-context";
import type { PostalOrderSettings } from "@/lib/db/schema";
import { cn, formatCurrency } from "@/lib/utils";

const brownieComboSchema = z.object({
	selectedCombo: z
		.string({
			required_error: "Please select a brownie combo.",
		})
		.min(1),
});

type BrownieComboFormValues = z.infer<typeof brownieComboSchema>;

interface PostalCombo {
	id: number;
	name: string;
	description: string;
	price: string;
	imageUrl: string | null;
	items: string[];
	status: string;
	createdAt: Date;
	updatedAt: Date;
	containsEgg: boolean;
}

async function fetchPostalCombos() {
	try {
		const { data } = await axios.get<{ data: PostalCombo[] }>(
			"/api/postal-combos",
		);
		return data.data;
	} catch (error) {
		console.error("Error fetching postal combos:", error);
		toast.error("Failed to load postal combos");
		return [];
	}
}

export default function PostalBrowniesClient({
	postalCombosList,
	settings,
	isAuthenticated,
}: {
	postalCombosList: PostalCombo[];
	settings: PostalOrderSettings[];
	isAuthenticated: boolean;
}) {
	const router = useRouter();
	const { clearCart, addItem } = useCart();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const checkoutSectionRef = useRef<HTMLDivElement>(null);

	// Get current month for postal order settings
	const currentMonth = format(new Date(), "yyyy-MM"); // YYYY-MM format
	const {
		arePostalOrdersAllowed,
		getEarliestAvailableSlot,
		isLoading: isPostalOrderSettingsLoading,
	} = usePostalOrderSettings(currentMonth, settings);

	const { data: postalCombos = [] } = useQuery({
		queryKey: ["postal-combos"],
		queryFn: fetchPostalCombos,
		initialData: postalCombosList,
	});

	const form = useForm<BrownieComboFormValues>({
		resolver: zodResolver(brownieComboSchema),
	});

	const selectedComboId = form.watch("selectedCombo");
	const selectedCombo = postalCombos.find(
		(combo) => combo.id.toString() === selectedComboId,
	);
	const selectedComboContainsEgg = selectedCombo
		? Boolean(selectedCombo.containsEgg)
		: false;
	const selectedComboEggBadgeVariant = selectedComboContainsEgg
		? "destructive"
		: "success";
	const selectedComboEggBadgeLabel = selectedComboContainsEgg
		? "Contains Egg"
		: "Eggless";
	const SelectedComboEggIcon = selectedComboContainsEgg ? Egg : EggOff;

	// Get the earliest available slot for displaying availability message
	const earliestSlot = getEarliestAvailableSlot();

	// Auto-scroll to checkout section when a combo is selected
	useEffect(() => {
		if (selectedComboId && checkoutSectionRef.current) {
			const timer = setTimeout(() => {
				checkoutSectionRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 300); // Small delay to allow UI to update first

			return () => clearTimeout(timer);
		}
	}, [selectedComboId]);

	const handleAddToCart = async (data: BrownieComboFormValues) => {
		if (!arePostalOrdersAllowed) {
			toast.error(
				"Postal brownie orders are not currently being accepted for this month",
			);
			return;
		}

		if (!isAuthenticated) {
			router.push("/login?redirect=/postal-brownies");
			return;
		}

		setIsSubmitting(true);

		try {
			const combo = postalCombos.find(
				(c) => c.id.toString() === data.selectedCombo,
			);
			if (!combo) return;

			// Clear existing cart since only one brownie combo is allowed per order
			clearCart();

			// Add the selected combo to cart
			addItem({
				id: combo.id,
				name: combo.name,
				price: Number(combo.price),
				quantity: 1,
				type: "postal-brownies",
			});

			router.push("/checkout");
		} catch (error) {
			console.error("Error adding to cart:", error);
			toast.error("Failed to add to cart. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-[calc(100svh-11rem)] bg-background">
			<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="text-center mb-6 sm:mb-8">
						<div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
							<Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
								Postal Brownies
							</h1>
						</div>
						<p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
							Indulge in our fudgy brownies delivered straight to your doorstep.
							Each combo is carefully crafted and securely packaged for the
							perfect gift or treat.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Package className="h-3 w-3 sm:h-4 sm:w-4" />
								<span>Only 1 brownie combo per order</span>
							</div>
							<div className="flex items-center gap-1">
								<Package className="h-3 w-3 sm:h-4 sm:w-4" />
								<span>Secure Packaging</span>
							</div>
						</div>
					</div>

					{/* Postal Order Restriction Banner */}
					{isPostalOrderSettingsLoading
						? null
						: !arePostalOrdersAllowed && (
								<FadeIn>
									<div className="mb-6 sm:mb-8">
										<div className="bg-orange-50 border border-orange-200 rounded-lg p-4 sm:p-6">
											<div className="flex items-start gap-3">
												<div className="shrink-0">
													<svg
														className="h-5 w-5 text-orange-600"
														viewBox="0 0 20 20"
														fill="currentColor"
														aria-hidden="true"
													>
														<path
															fillRule="evenodd"
															d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<div className="flex-1">
													<h3 className="text-sm sm:text-base font-medium text-orange-800">
														Postal Brownie Orders Currently Unavailable
													</h3>
													<p className="text-xs sm:text-sm text-orange-700 mt-1 leading-relaxed">
														{earliestSlot ? (
															<>
																We will be available to take orders starting{" "}
																<span className="font-semibold">
																	{new Date(
																		earliestSlot.orderStartDate,
																	).toLocaleDateString("en-US", {
																		weekday: "long",
																		year: "numeric",
																		month: "long",
																		day: "numeric",
																	})}
																</span>
																. Please check back on that date to place your
																postal brownie order.
															</>
														) : (
															"We are not accepting postal brownie orders for this month. Please check back later or contact us for more information about upcoming order periods."
														)}
													</p>
												</div>
											</div>
										</div>
									</div>
								</FadeIn>
							)}

					{/* Form */}
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleAddToCart)}
							className="space-y-6 sm:space-y-8"
						>
							<FormField
								control={form.control}
								name="selectedCombo"
								render={({ field }) => (
									<FormItem className="space-y-4 sm:space-y-6">
										<FormLabel className="text-lg sm:text-xl font-semibold block text-center">
											Choose Your Brownie Combo
										</FormLabel>
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												value={field.value}
											>
												{postalCombos.length === 0 ? (
													<Empty>
														<EmptyHeader>
															<EmptyMedia variant="icon">
																<Package />
															</EmptyMedia>
															<EmptyTitle>No Combos Available</EmptyTitle>
															<EmptyDescription>
																No postal brownie combos are available at the
																moment. Check back soon for delicious options!
															</EmptyDescription>
														</EmptyHeader>
													</Empty>
												) : (
													<StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
														{postalCombos.map((combo) => {
															const containsEgg = Boolean(combo.containsEgg);
															const eggBadgeVariant = containsEgg
																? "destructive"
																: "success";
															const eggBadgeLabel = containsEgg
																? "Contains Egg"
																: "Eggless";
															const EggIcon = containsEgg ? Egg : EggOff;

															return (
																<StaggerItem key={combo.id} className="h-full">
																	<FormItem
																		key={combo.id}
																		className="space-y-0 h-full"
																	>
																		<FormControl>
																			<RadioGroupItem
																				value={combo.id.toString()}
																				id={combo.id.toString()}
																				className="sr-only"
																			/>
																		</FormControl>
																		<Label
																			htmlFor={combo.id.toString()}
																			className="cursor-pointer block w-full "
																		>
																			<Card
																				className={cn(
																					"transition-all duration-200 hover:shadow-lg active:scale-[0.98] h-full flex flex-col ",
																					combo.imageUrl ? "pt-0" : "",
																					field.value === combo.id.toString()
																						? "ring-2 ring-primary shadow-lg bg-primary/5"
																						: "hover:shadow-md",
																				)}
																			>
																				{combo.imageUrl && (
																					<div className="relative aspect-4/3 sm:aspect-video w-full">
																						<Image
																							src={combo.imageUrl}
																							alt={combo.name}
																							fill
																							className="object-cover rounded-t-lg"
																							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
																						/>
																					</div>
																				)}
																				<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
																					<div className="flex flex-col justify-between items-start gap-2">
																						<CardTitle className="text-base sm:text-lg leading-tight flex-1">
																							{combo.name}
																						</CardTitle>
																						<div className="flex items-center justify-between w-full gap-2">
																							<div>
																								<Badge
																									variant={eggBadgeVariant}
																									className="gap-1 shrink-0 "
																								>
																									<EggIcon className="h-3 w-3" />
																									{eggBadgeLabel}
																								</Badge>
																							</div>

																							<Badge
																								variant={"default"}
																								className="gap-1 shrink-0"
																							>
																								{formatCurrency(
																									Number(combo.price),
																								)}
																							</Badge>
																						</div>
																					</div>
																				</CardHeader>
																				<CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6 flex-1 flex flex-col">
																					<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
																						{combo.description}
																					</p>
																					<div className="space-y-2 mt-auto">
																						<h4 className="font-medium text-xs sm:text-sm">
																							Includes:
																						</h4>
																						<ul className="space-y-1">
																							{combo.items.map(
																								(item: string) => (
																									<li
																										key={item}
																										className="text-xs text-muted-foreground flex items-center"
																									>
																										<span className="w-1 h-1 bg-primary rounded-full mr-2 shrink-0" />
																										{item}
																									</li>
																								),
																							)}
																						</ul>
																					</div>
																				</CardContent>
																			</Card>
																		</Label>
																	</FormItem>
																</StaggerItem>
															);
														})}
													</StaggerContainer>
												)}
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Selected combo summary */}
							{selectedCombo && (
								<div ref={checkoutSectionRef}>
									<Card className="bg-muted/50">
										<CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6">
											<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
												<div className="flex-1 space-y-2">
													<h3 className="font-semibold text-sm sm:text-base">
														{selectedCombo.name}
													</h3>
													<Badge
														variant={selectedComboEggBadgeVariant}
														className="gap-1 w-fit"
													>
														<SelectedComboEggIcon className="h-3 w-3" />
														{selectedComboEggBadgeLabel}
													</Badge>
													<p className="text-xs sm:text-sm text-muted-foreground">
														Ready to add to cart
													</p>
												</div>
												<div className="text-left sm:text-right">
													<div className="text-xl sm:text-2xl font-bold">
														{formatCurrency(Number(selectedCombo.price))}
													</div>
													<div className="text-xs text-muted-foreground">
														Per combo
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							)}

							<FadeIn delay={0.1}>
								{/* Action buttons */}
								<div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
									<div className="flex-1" />
									<Button
										type="button"
										variant="outline"
										onClick={() => router.back()}
										className=""
										size="lg"
									>
										Back
									</Button>
									<Button
										type="submit"
										disabled={
											!selectedCombo || isSubmitting || !arePostalOrdersAllowed
										}
										size="lg"
										variant={!arePostalOrdersAllowed ? "secondary" : "default"}
									>
										{!arePostalOrdersAllowed
											? "Orders Not Available"
											: isSubmitting
												? "Adding to Cart..."
												: "Checkout"}
									</Button>
								</div>
							</FadeIn>

							<FadeIn delay={0.2}>
								{/* Important notice banner */}
								<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
									<div className="flex items-start gap-3">
										<div className="shrink-0">
											<svg
												className="h-5 w-5 text-amber-600"
												viewBox="0 0 20 20"
												fill="currentColor"
												aria-hidden="true"
											>
												<path
													fillRule="evenodd"
													d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<div className="flex-1">
											<h3 className="text-sm sm:text-base font-medium text-amber-800">
												Important Notice
											</h3>
											<p className="text-xs sm:text-sm text-amber-700 mt-1 leading-relaxed">
												Only one brownie combo per order. Adding a new combo
												will replace your current cart.
											</p>
										</div>
									</div>
								</div>
							</FadeIn>
						</form>
					</Form>
				</div>
			</div>
		</div>
	);
}
