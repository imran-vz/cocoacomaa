"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CalendarDays, Clock, Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import LoginModal from "@/components/LoginModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/lib/cart-context";
import type { SpecialsSettings } from "@/lib/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Special {
	id: number;
	name: string;
	price: number;
	description: string | null;
	imageUrl: string | null;
	category: "special";
	leadTimeDays: number;
	status: "available" | "unavailable";
}

const fetchSpecials = async () => {
	try {
		const { data } = await axios.get<Special[]>(
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

export default function SpecialsPage() {
	const router = useRouter();
	const { items, addItem, removeItem, updateQuantity, clearNonSpecials } =
		useCart();

	const { data: session, status } = useSession();

	const { data: specials, isLoading: isLoadingSpecials } = useQuery({
		queryKey: ["specials"],
		queryFn: fetchSpecials,
	});

	const { data: settings, isLoading: isLoadingSettings } = useQuery({
		queryKey: ["specials-settings"],
		queryFn: fetchSpecialsSettings,
	});

	// Show loading while checking authentication
	if (status === "loading") {
		return (
			<div className="container mx-auto p-4 sm:p-6">
				<div className="max-w-4xl mx-auto">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }, (_, i) => (
								<div
									key={`loading-special-${Math.random()}-${i}`}
									className="h-96 bg-gray-200 rounded-lg"
								></div>
							))}
						</div>
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
				<LoginModal open={true} onClose={() => {}} redirect="/specials" />
			</div>
		);
	}

	// If specials are not active, show message
	if (!isLoadingSettings && !settings?.isActive) {
		return (
			<div className="container mx-auto p-4 sm:p-6">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-3xl font-bold mb-6">Specials</h1>
					<Alert>
						<AlertTitle>Specials Not Available</AlertTitle>
						<AlertDescription>
							Specials are currently not available. Please check back later!
						</AlertDescription>
					</Alert>
				</div>
			</div>
		);
	}

	if (isLoadingSpecials || isLoadingSettings) {
		return (
			<div className="container mx-auto p-4 sm:p-6">
				<div className="max-w-4xl mx-auto">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }, (_, i) => (
								<div
									key={`loading-special-${Math.random()}-${i}`}
									className="h-96 bg-gray-200 rounded-lg"
								></div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	const handleAddToCart = (special: Special) => {
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

	const handleCheckout = () => {
		if (!session?.user?.id) {
			router.push("/login?redirect=/specials");
			return;
		}

		if (items.length === 0) return;
		router.push("/checkout");
	};

	const availableSpecials =
		specials?.filter((special) => special.status === "available") || [];

	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="max-w-4xl mx-auto">
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
										<span className="font-medium">Pickup Date:</span>
										<Badge variant="outline">
											{formatDate(new Date(settings.pickupDate))}
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
				</div>

				{availableSpecials.length === 0 ? (
					<Alert>
						<AlertTitle>No Specials Available</AlertTitle>
						<AlertDescription>
							There are currently no specials available. Please check back
							later!
						</AlertDescription>
					</Alert>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{availableSpecials.map((special) => {
							const quantity = getItemQuantity(special.id);

							return (
								<Card
									key={special.id}
									className="overflow-hidden group hover:shadow-lg transition-shadow"
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
										<div className="flex justify-between items-start">
											<CardTitle className="text-lg">{special.name}</CardTitle>
											<Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
												Special
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										{special.description && (
											<p className="text-sm text-muted-foreground">
												{special.description}
											</p>
										)}

										<div className="flex justify-between items-center">
											<span className="text-2xl font-bold text-primary">
												{formatCurrency(special.price)}
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
													<span className="font-medium min-w-[2rem] text-center">
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

				{/* Cart Summary */}
				{items.length > 0 && (
					<div className="fixed bottom-6 right-6 z-50">
						<Card className="shadow-lg">
							<CardContent className="p-4">
								<div className="flex items-center gap-4">
									<div>
										<p className="font-medium">
											{items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
											items
										</p>
										<p className="text-sm text-muted-foreground">
											{formatCurrency(
												items.reduce(
													(sum, item) => sum + item.price * item.quantity,
													0,
												),
											)}
										</p>
									</div>
									<Button onClick={handleCheckout}>Checkout</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
