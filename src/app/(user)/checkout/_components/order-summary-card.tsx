import { CalendarIcon, Clock, Package } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CartItem } from "@/lib/cart-context";
import { config } from "@/lib/config";
import { formatLocalDate } from "@/lib/format-timestamp";
import { formatCurrency } from "@/lib/utils";

type Dessert = {
	id: number;
	leadTimeDays: number;
};

type Address = {
	id: number;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	zip: string;
};

type OrderSummaryCardProps = {
	// biome-ignore lint/suspicious/noExplicitAny: we need to use any here because the form is dynamically generated
	form: UseFormReturn<any>;
	items: CartItem[];
	total: number;
	deliveryCost: number;
	isDiscountApplied: boolean;
	isPostalBrownies: boolean;
	hasSpecials: boolean;
	maxLeadTime: number;
	desserts: Dessert[];
	addresses: Address[];
	timeSlots: Array<{ value: string; label: string }>;
	specialsSettings?: {
		pickupStartDate: string;
		pickupEndDate: string;
		pickupStartTime: string;
		pickupEndTime: string;
	} | null;
	getCurrentActiveSlot?: () => {
		dispatchStartDate: string;
		dispatchEndDate: string;
	} | null;
};

export function OrderSummaryCard({
	form,
	items,
	total,
	deliveryCost,
	isDiscountApplied,
	isPostalBrownies,
	hasSpecials,
	maxLeadTime,
	desserts,
	addresses,
	timeSlots,
	specialsSettings,
	getCurrentActiveSlot,
}: OrderSummaryCardProps) {
	const finalTotal = Number(total) + deliveryCost;

	return (
		<Card className="order-1 lg:order-2">
			<CardHeader className="pb-4 sm:pb-6">
				<CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
				{!isPostalBrownies && !hasSpecials && items.length > 0 && (
					<div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
						<Clock className="h-4 w-4 text-blue-600" />
						<div className="text-sm">
							<span className="font-medium text-blue-800">
								Lead Time Required:{" "}
							</span>
							<span className="text-blue-700">
								{maxLeadTime} day{maxLeadTime > 1 ? "s" : ""} minimum
							</span>
						</div>
					</div>
				)}
				{hasSpecials && specialsSettings && (
					<div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
						<CalendarIcon className="h-4 w-4 text-purple-600" />
						<div className="text-sm">
							<span className="font-medium text-purple-800">
								Pickup Available:{" "}
							</span>
							<span className="text-purple-700">
								{formatLocalDate(new Date(specialsSettings.pickupStartDate))} to{" "}
								{formatLocalDate(new Date(specialsSettings.pickupEndDate))} at{" "}
								{specialsSettings.pickupStartTime} -{" "}
								{specialsSettings.pickupEndTime}
							</span>
						</div>
					</div>
				)}
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-3 sm:space-y-4">
					{items.map((item) => {
						const dessert =
							item.type === "cake-orders"
								? desserts.find((d) => d.id === item.id)
								: null;

						return (
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
									{dessert && item.category !== "special" && (
										<p className="text-xs text-blue-600 mt-1">
											{dessert.leadTimeDays} day
											{dessert.leadTimeDays > 1 ? "s" : ""} lead time
										</p>
									)}
								</div>
								<div className="font-medium text-sm sm:text-base shrink-0">
									{formatCurrency(Number(item.price) * item.quantity)}
								</div>
							</div>
						);
					})}

					<div className="border-t pt-3 sm:pt-4 space-y-2">
						<div className="flex justify-between items-center text-sm sm:text-base">
							<span>Subtotal:</span>
							<span>{formatCurrency(Number(total))}</span>
						</div>

						{isPostalBrownies && (
							<div className="space-y-1">
								<div className="flex justify-between items-center text-sm sm:text-base">
									<span>Delivery:</span>
									<div className="text-right">
										{isDiscountApplied && (
											<div className="text-xs text-muted-foreground line-through">
												{formatCurrency(config.postalDeliveryCost)}
											</div>
										)}
										<span
											className={
												isDiscountApplied ? "text-green-600 font-medium" : ""
											}
										>
											{formatCurrency(deliveryCost)}
										</span>
									</div>
								</div>
								{isDiscountApplied && (
									<div className="text-xs text-green-600 text-right">
										Bengaluru discount applied! 🎉
									</div>
								)}
							</div>
						)}

						<div className="flex justify-between items-center font-medium text-base sm:text-lg border-t pt-2">
							<span>Total:</span>
							<span>{formatCurrency(finalTotal)}</span>
						</div>
					</div>

					{/* Pickup Info Display - For specials orders */}
					{!isPostalBrownies && hasSpecials && form.watch("pickupDate") && (
						<div className="border-t pt-3 sm:pt-4">
							<div className="flex items-center gap-2 mb-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm sm:text-base font-medium">
									Selected Pickup Date
								</span>
							</div>
							<p className="text-sm sm:text-base text-muted-foreground">
								{formatLocalDate(form.watch("pickupDate") as Date)} at{" "}
								{specialsSettings?.pickupStartTime} -{" "}
								{specialsSettings?.pickupEndTime}
							</p>
						</div>
					)}

					{/* Pickup Info Display - Only for non-postal orders and non-specials */}
					{!isPostalBrownies &&
						!hasSpecials &&
						(form.watch("pickupDate") || form.watch("pickupTime")) && (
							<div className="border-t pt-3 sm:pt-4">
								<div className="flex items-center gap-2 mb-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm sm:text-base font-medium">
										Pickup Details
									</span>
								</div>
								{form.watch("pickupDate") && (
									<p className="text-xs sm:text-sm text-muted-foreground">
										Date: {formatLocalDate(form.watch("pickupDate") as Date)}
									</p>
								)}
								{form.watch("pickupTime") && (
									<p className="text-xs sm:text-sm text-muted-foreground">
										Time:{" "}
										{
											timeSlots.find(
												(t) => t.value === form.watch("pickupTime"),
											)?.label
										}
									</p>
								)}
							</div>
						)}

					{/* Delivery Address Display - Only for postal brownies */}
					{isPostalBrownies && form.watch("selectedAddressId") && (
						<div className="border-t pt-3 sm:pt-4">
							<div className="flex items-center gap-2 mb-2">
								<Package className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm sm:text-base font-medium">
									Delivery Information
								</span>
							</div>
							{(() => {
								const selectedAddress = addresses.find(
									(addr) => addr.id === form.watch("selectedAddressId"),
								);
								const currentSlot = getCurrentActiveSlot?.();

								return (
									<div className="space-y-3">
										{selectedAddress && (
											<div>
												<p className="text-xs font-medium text-muted-foreground mb-1">
													Address:
												</p>
												<div className="text-xs sm:text-sm text-muted-foreground space-y-1">
													<p className="font-medium text-foreground">
														{selectedAddress.addressLine1}
													</p>
													{selectedAddress.addressLine2 && (
														<p>{selectedAddress.addressLine2}</p>
													)}
													<p>
														{selectedAddress.city}, {selectedAddress.state}{" "}
														{selectedAddress.zip}
													</p>
												</div>
											</div>
										)}

										{currentSlot && (
											<div>
												<p className="text-xs font-medium text-muted-foreground mb-1">
													Dispatch Period:
												</p>
												<div className="text-xs sm:text-sm text-muted-foreground">
													<p className="font-medium text-foreground">
														{new Date(
															currentSlot.dispatchStartDate,
														).toLocaleDateString("en-US", {
															weekday: "short",
															month: "short",
															day: "numeric",
														})}{" "}
														-{" "}
														{new Date(
															currentSlot.dispatchEndDate,
														).toLocaleDateString("en-US", {
															weekday: "short",
															month: "short",
															day: "numeric",
														})}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														Your order will be dispatched during this period
													</p>
												</div>
											</div>
										)}
									</div>
								);
							})()}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
