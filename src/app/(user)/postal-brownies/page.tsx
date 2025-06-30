"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Package } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";

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
}

const fetchPostalCombos = async (): Promise<PostalCombo[]> => {
	try {
		const { data } = await axios.get<{ postalCombos: PostalCombo[] }>(
			"/api/postal-combos",
		);
		return data.postalCombos;
	} catch (error) {
		console.error("Error fetching postal combos:", error);
		toast.error("Failed to load postal combos");
		return [];
	}
};

export default function PostalBrowniesPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const { clearCart, addItem } = useCart();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { data: postalCombos = [], isLoading } = useQuery({
		queryKey: ["postal-combos"],
		queryFn: fetchPostalCombos,
	});

	const form = useForm<BrownieComboFormValues>({
		resolver: zodResolver(brownieComboSchema),
	});

	const selectedComboId = form.watch("selectedCombo");
	const selectedCombo = postalCombos.find(
		(combo) => combo.id.toString() === selectedComboId,
	);

	const handleAddToCart = async (data: BrownieComboFormValues) => {
		if (!session) {
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

			toast.success("Brownie combo added to cart!");
			router.push("/checkout");
		} catch (error) {
			console.error("Error adding to cart:", error);
			toast.error("Failed to add to cart. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
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
							Indulge in our secure brownies delivered straight to your
							doorstep. Each combo is carefully crafted and beautifully packaged
							for the perfect gift or treat.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Package className="h-3 w-3 sm:h-4 sm:w-4" />
								<span>Secure Packaging</span>
							</div>
						</div>
					</div>

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
												className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
											>
												{isLoading ? (
													<div className="col-span-full text-center py-6 sm:py-8">
														<div className="animate-pulse">
															<div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
														</div>
														<p className="text-sm sm:text-base text-muted-foreground mt-2">
															Loading postal combos...
														</p>
													</div>
												) : postalCombos.length === 0 ? (
													<div className="col-span-full text-center py-6 sm:py-8">
														<Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2" />
														<p className="text-sm sm:text-base text-muted-foreground">
															No postal combos available at the moment.
														</p>
													</div>
												) : (
													postalCombos.map((combo) => (
														<FormItem key={combo.id} className="space-y-0">
															<FormControl>
																<RadioGroupItem
																	value={combo.id.toString()}
																	id={combo.id.toString()}
																	className="sr-only"
																/>
															</FormControl>
															<Label
																htmlFor={combo.id.toString()}
																className="cursor-pointer block w-full"
															>
																<Card
																	className={`transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${
																		field.value === combo.id.toString()
																			? "ring-2 ring-primary shadow-lg bg-primary/5"
																			: "hover:shadow-md"
																	} h-full flex flex-col`}
																>
																	{combo.imageUrl && (
																		<div className="relative aspect-[4/3] sm:aspect-video w-full">
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
																		<div className="flex flex-col sm:flex-row justify-between items-start gap-2">
																			<CardTitle className="text-base sm:text-lg leading-tight flex-1">
																				{combo.name}
																			</CardTitle>
																			<div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs sm:text-sm font-medium shrink-0">
																				{formatCurrency(Number(combo.price))}
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
																				{combo.items.map((item: string) => (
																					<li
																						key={item}
																						className="text-xs text-muted-foreground flex items-center"
																					>
																						<span className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0" />
																						{item}
																					</li>
																				))}
																			</ul>
																		</div>
																	</CardContent>
																</Card>
															</Label>
														</FormItem>
													))
												)}
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Selected combo summary */}
							{selectedCombo && (
								<Card className="bg-muted/50">
									<CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6">
										<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
											<div className="flex-1">
												<h3 className="font-semibold text-sm sm:text-base">
													{selectedCombo.name}
												</h3>
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
							)}

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
									disabled={!selectedCombo || isSubmitting}
									size="lg"
								>
									{isSubmitting
										? "Adding to Cart..."
										: "Add to Cart & Checkout"}
								</Button>
							</div>

							{/* Note about single combo per order */}
							<div className="text-center px-4">
								<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
									Note: Only one brownie combo per order. Adding a new combo
									will replace your current cart.
								</p>
							</div>
						</form>
					</Form>
				</div>
			</div>
		</div>
	);
}
