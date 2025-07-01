"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Package, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OrderRestrictionBanner from "@/components/ui/order-restriction-banner";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useAddresses,
	useCreateAddress,
	useDeleteAddress,
} from "@/hooks/use-addresses";
import { useOrderSettings } from "@/hooks/use-order-settings";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import type {
	RazorpayOptions,
	RazorpayOrderData,
	RazorpayResponse,
} from "@/types/razorpay";

declare global {
	interface Window {
		Razorpay: new (
			options: RazorpayOptions,
		) => {
			open: () => void;
			on: (event: string, callback: (error: Error) => void) => void;
		};
	}
}

// Generate available time slots from 12pm to 6pm
const timeSlots = [
	{ value: "12:00", label: "12:00 PM" },
	{ value: "12:30", label: "12:30 PM" },
	{ value: "13:00", label: "1:00 PM" },
	{ value: "13:30", label: "1:30 PM" },
	{ value: "14:00", label: "2:00 PM" },
	{ value: "14:30", label: "2:30 PM" },
	{ value: "15:00", label: "3:00 PM" },
	{ value: "15:30", label: "3:30 PM" },
	{ value: "16:00", label: "4:00 PM" },
	{ value: "16:30", label: "4:30 PM" },
	{ value: "17:00", label: "5:00 PM" },
	{ value: "17:30", label: "5:30 PM" },
	{ value: "18:00", label: "6:00 PM" },
];

// Calculate date constraints
const getDateConstraints = () => {
	const today = new Date();
	const minDate = new Date(today);
	minDate.setDate(today.getDate() + 3); // Minimum 3 days from today

	const maxDate = new Date(today);
	maxDate.setDate(today.getDate() + 33); // Maximum 33 days from today

	return { minDate, maxDate };
};

// Check if date is disabled (Monday, Tuesday, or outside range)
const isDateDisabled = (date: Date) => {
	const { minDate, maxDate } = getDateConstraints();
	const dayOfWeek = date.getDay();

	// Disable if before min date or after max date
	if (date < minDate || date > maxDate) {
		return true;
	}

	// Disable Monday (1) and Tuesday (2)
	return dayOfWeek === 1 || dayOfWeek === 2;
};

const createCheckoutFormSchema = (isPostalBrownies: boolean) => {
	const baseSchema = z.object({
		name: z.string().min(2, {
			message: "Name must be at least 2 characters.",
		}),
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		phone: z
			.string()
			.min(10, {
				message: "Phone number must be at least 10 digits.",
			})
			.regex(/^[0-9+\-\s()]+$/, {
				message: "Please enter a valid phone number.",
			}),
		// Pickup fields - only required for non-postal orders
		pickupDate: isPostalBrownies
			? z.date().optional()
			: z.date({
					required_error: "Please select a pickup date.",
				}),
		pickupTime: isPostalBrownies
			? z.string().optional()
			: z.string().min(1, {
					message: "Please select a pickup time.",
				}),
		notes: z
			.string()
			.max(isPostalBrownies ? 250 : 25, {
				message: `Notes must be less than ${isPostalBrownies ? 250 : 25} characters.`,
			})
			.optional(),
		orderType: z.enum(["cake-orders", "postal-brownies"]),
		// Address fields - conditional for postal brownies
		addressMode: isPostalBrownies
			? z.enum(["existing", "new"])
			: z.enum(["existing", "new"]).optional(),
		selectedAddressId: isPostalBrownies
			? z.number().min(1, { message: "Please select a delivery address" })
			: z.number().optional(),
		// New address fields (only used when addressMode is "new")
		addressLine1: z.string().optional(),
		addressLine2: z.string().optional(),
		city: z.string().optional(),
		state: z.string().optional(),
		zip: z.string().optional(),
	});

	return baseSchema;
};

// Address validation schema
const addressSchema = z.object({
	addressLine1: z.string().min(2, {
		message: "Address line 1 must be at least 2 characters.",
	}),
	addressLine2: z.string().optional(),
	city: z.string().min(2, {
		message: "City must be at least 2 characters.",
	}),
	state: z.string().min(2, {
		message: "State must be at least 2 characters.",
	}),
	zip: z.string().min(5, {
		message: "ZIP code must be at least 5 characters.",
	}),
});

type CheckoutPageProps = {
	user: {
		email: string;
		phone: string;
		name: string;
	};
};

export default function CheckoutPage({
	user: { email, phone, name },
}: CheckoutPageProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { items, total, clearCart } = useCart();
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingStep, setProcessingStep] = useState("");
	const [existingOrderId, setExistingOrderId] = useState<string | null>(null);
	const [isCreatingAddress, setIsCreatingAddress] = useState(false);
	const existingId = useId();
	const newId = useId();
	const { areOrdersAllowed: ordersAllowed } = useOrderSettings();

	// React Query hooks for address management
	const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
	const createAddressMutation = useCreateAddress();
	const deleteAddressMutation = useDeleteAddress();

	// Check if cart contains postal brownies
	const isPostalBrownies = items.some(
		(item) => item.type === "postal-brownies",
	);
	const checkoutFormSchema = createCheckoutFormSchema(isPostalBrownies);

	type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

	const form = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutFormSchema),
		defaultValues: {
			name: name ?? "",
			email: email ?? "",
			phone: phone ?? "",
			pickupTime: "",
			notes: "",
			orderType: isPostalBrownies ? "postal-brownies" : "cake-orders",
			addressMode: isPostalBrownies ? "new" : undefined,
			selectedAddressId: undefined,
			addressLine1: "",
			addressLine2: "",
			city: "",
			state: "",
			zip: "",
		},
	});

	const addressMode = useWatch({
		control: form.control,
		name: "addressMode",
	});

	const selectedAddressId = useWatch({
		control: form.control,
		name: "selectedAddressId",
	});

	// Load Razorpay script
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	// Check for existing order ID in URL params
	useEffect(() => {
		const orderId = searchParams.get("orderId");
		if (orderId) {
			setExistingOrderId(orderId);
		}
	}, [searchParams]);

	// Set default address mode when addresses are loaded
	useEffect(() => {
		if (isPostalBrownies) {
			if (addresses.length > 0 && !addressMode) {
				form.setValue("addressMode", "existing");
				// If only one address, auto-select it
				if (addresses.length === 1 && !selectedAddressId) {
					form.setValue("selectedAddressId", addresses[0].id);
				}
			} else if (addresses.length === 0 && addressMode === "existing") {
				// If no addresses left and in existing mode, switch to new mode
				form.setValue("addressMode", "new");
				form.setValue("selectedAddressId", undefined);
			}
		}
	}, [isPostalBrownies, addresses, form, addressMode, selectedAddressId]);

	// Handle address creation separately
	const handleCreateAddress = async () => {
		const addressData = {
			addressLine1: form.getValues("addressLine1") || "",
			addressLine2: form.getValues("addressLine2") || "",
			city: form.getValues("city") || "",
			state: form.getValues("state") || "",
			zip: form.getValues("zip") || "",
		};

		// Validate address fields using Zod schema
		const validation = addressSchema.safeParse(addressData);
		if (!validation.success) {
			const errors = validation.error.errors;
			const errorMessage = errors.map((error) => error.message).join(", ");
			toast.error(errorMessage);
			return;
		}

		try {
			setIsCreatingAddress(true);
			const newAddress = await createAddressMutation.mutateAsync(
				validation.data,
			);

			// Select the newly created address and switch to existing mode
			form.setValue("selectedAddressId", newAddress.id);
			form.setValue("addressMode", "existing");

			// Clear the new address form fields
			form.setValue("addressLine1", "");
			form.setValue("addressLine2", "");
			form.setValue("city", "");
			form.setValue("state", "");
			form.setValue("zip", "");

			toast.success("Address created and selected successfully!");
		} catch (error) {
			console.error("Error creating address:", error);
			toast.error("Failed to create address. Please try again.");
		} finally {
			setIsCreatingAddress(false);
		}
	};

	// Handle address deletion with confirmation
	const handleDeleteAddress = async (addressId: number) => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this address?",
		);
		if (!confirmed) return;

		try {
			await deleteAddressMutation.mutateAsync(addressId);

			// If the deleted address was selected, clear the selection
			if (selectedAddressId === addressId) {
				form.setValue("selectedAddressId", undefined);
			}
		} catch (error) {
			console.error("Error deleting address:", error);
		}
	};

	const handlePayment = async (
		orderData: CheckoutFormValues,
		orderId: string,
		razorpayOrderData: RazorpayOrderData,
	) => {
		setProcessingStep("Opening payment gateway...");

		const options: RazorpayOptions = {
			key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
			amount: razorpayOrderData.amount,
			currency: razorpayOrderData.currency,
			name: "Cocoa Comaa",
			description: "Dessert Order Payment",
			order_id: razorpayOrderData.razorpayOrderId,
			image: "/logo.png",
			remember_customer: true,
			handler: async (response: RazorpayResponse) => {
				try {
					setProcessingStep("Verifying payment...");

					// Verify payment
					const verifyResponse = await fetch("/api/orders/verify", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							razorpay_order_id: response.razorpay_order_id,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
							orderId,
						}),
					});

					if (verifyResponse.ok) {
						setProcessingStep("Finalizing order...");

						// Clear order ID from URL params
						const url = new URL(window.location.href);
						url.searchParams.delete("orderId");
						window.history.replaceState({}, "", url.toString());

						// Redirect to confirmation page with order ID
						router.push(`/order-confirmation?orderId=${orderId}`);

						// Show success message
						toast.success("Payment successful! Order confirmed.");

						// Clear the cart
						clearCart();
					} else {
						throw new Error("Payment verification failed");
					}
				} catch (error) {
					console.error("Payment verification error:", error);
					toast.error("Payment verification failed. Please contact support.");
					setIsProcessing(false);
					setProcessingStep("");
				}
			},
			modal: {
				ondismiss: () => {
					setIsProcessing(false);
					setProcessingStep("");
				},
			},
			prefill: {
				name: orderData.name,
				email: orderData.email,
				contact: orderData.phone,
			},
			theme: { color: "#551303" },
		};

		const razorpay = new window.Razorpay(options);
		razorpay.on("payment.failed", (error) => {
			console.error("Payment failed:", error);
			toast.error("Payment failed. Please try again.");
			setIsProcessing(false);
			setProcessingStep("");
		});
		razorpay.open();
	};

	const onSubmit = async (data: CheckoutFormValues) => {
		if (!ordersAllowed) {
			toast.error("Orders are only accepted on Mondays and Tuesdays");
			return;
		}

		try {
			setIsProcessing(true);

			let orderData: RazorpayOrderData;
			let orderId: string;

			// Check if we have an existing order ID
			if (existingOrderId) {
				setProcessingStep("Retrieving existing order...");

				// Try to get existing order data
				const existingOrderResponse = await fetch(
					`/api/orders/${existingOrderId}`,
					{
						method: "GET",
						headers: { "Content-Type": "application/json" },
					},
				);

				if (existingOrderResponse.ok) {
					const existingOrderData = await existingOrderResponse.json();
					if (
						existingOrderData.success &&
						existingOrderData.order.status !== "paid"
					) {
						// Reuse existing order
						orderData = existingOrderData.order;
						orderId = existingOrderId;
						setProcessingStep("Preparing payment...");
					} else {
						throw new Error("Existing order is no longer valid");
					}
				} else {
					throw new Error("Could not retrieve existing order");
				}
			} else {
				setProcessingStep("Creating your order...");

				// Create new order in database and get Razorpay order
				const orderResponse = await fetch("/api/orders", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: data.name,
						email: data.email,
						phone: data.phone,
						pickupDate: data.pickupDate
							? data.pickupDate.toISOString()
							: undefined,
						pickupTime: data.pickupTime || undefined,
						notes: data.notes ?? "",
						items: items.map((item) => ({
							id: item.id,
							name: item.name,
							price: item.price,
							quantity: item.quantity,
						})),
						orderType: isPostalBrownies ? "postal-brownies" : "cake-orders",
						total,
						// Include selected address ID for postal brownies
						selectedAddressId: isPostalBrownies
							? data.selectedAddressId
							: undefined,
					}),
				});

				if (!orderResponse.ok) {
					throw new Error("Failed to create order");
				}

				const newOrderData = await orderResponse.json();

				if (!newOrderData.success) {
					throw new Error("Failed to create order");
				}

				orderData = newOrderData;
				orderId = newOrderData.orderId;

				// Add order ID to URL params
				const url = new URL(window.location.href);
				url.searchParams.set("orderId", orderId);
				router.replace(`${url.pathname}?${url.searchParams.toString()}`);
				setExistingOrderId(orderId);

				setProcessingStep("Preparing payment...");
			}

			// Initiate payment
			await handlePayment(data, orderId, orderData);
		} catch (error) {
			console.error("Error processing order:", error);
			toast.error("Failed to process order. Please try again.");
			setIsProcessing(false);
			setProcessingStep("");
		}
	};

	if (items.length === 0) {
		return (
			<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
				<Card>
					<CardContent className="py-6 sm:py-8 text-center">
						<h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
							Your cart is empty
						</h2>
						<p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
							Add some desserts to your cart before checking out.
						</p>
						<Button onClick={() => router.push("/order")} size="lg">
							Browse Desserts
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 relative">
			{/* Loading Overlay */}
			{isProcessing && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-white rounded-lg p-6 sm:p-8 max-w-sm mx-4 text-center shadow-xl">
						<div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4" />
						<h3 className="text-lg sm:text-xl font-semibold mb-2">
							Processing Order
						</h3>
						<p className="text-sm sm:text-base text-muted-foreground">
							{processingStep || "Please wait..."}
						</p>
						<p className="text-xs text-muted-foreground mt-2">
							Do not close this window
						</p>
					</div>
				</div>
			)}

			<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">
				Checkout
			</h1>

			{/* Show order restriction banner when orders are not allowed */}
			{!ordersAllowed && <OrderRestrictionBanner />}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
				{/* Customer Information */}
				<Card className="order-2 lg:order-1">
					<CardHeader className="pb-4 sm:pb-6">
						<CardTitle className="text-lg sm:text-xl">
							Customer Information
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className={`space-y-4 sm:space-y-6 ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
							>
								{/* Hidden orderType field */}
								<FormField
									control={form.control}
									name="orderType"
									render={({ field }) => (
										<input
											type="hidden"
											{...field}
											value={
												isPostalBrownies ? "postal-brownies" : "cake-orders"
											}
										/>
									)}
								/>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm sm:text-base">
												Full Name
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your full name"
													{...field}
													className="text-sm sm:text-base"
													disabled
													readOnly
													tabIndex={-1}
												/>
											</FormControl>
											<FormMessage className="text-xs sm:text-sm" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm sm:text-base">
												Email Address
											</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="Enter your email address"
													{...field}
													className="text-sm sm:text-base"
													readOnly
													disabled
													tabIndex={-1}
												/>
											</FormControl>
											<FormMessage className="text-xs sm:text-sm" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm sm:text-base">
												Phone Number
											</FormLabel>
											<FormControl>
												<Input
													type="tel"
													placeholder="Enter your phone number"
													{...field}
													className="text-sm sm:text-base "
													readOnly
													disabled
													tabIndex={-1}
												/>
											</FormControl>
											<FormMessage className="text-xs sm:text-sm" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm sm:text-base">
												{isPostalBrownies
													? "Delivery Instructions"
													: "Message on Cake"}
											</FormLabel>
											<FormControl>
												<Input
													placeholder={
														isPostalBrownies
															? "Special delivery instructions or notes"
															: "Keep it short and sweet"
													}
													{...field}
													className="text-sm sm:text-base"
													maxLength={isPostalBrownies ? 250 : 25}
												/>
											</FormControl>
											<FormDescription className="text-xs sm:text-sm text-muted-foreground">
												Maximum {isPostalBrownies ? 250 : 25} characters
											</FormDescription>
											<FormMessage className="text-xs sm:text-sm" />
										</FormItem>
									)}
								/>

								{/* Address Fields - Only for postal brownies */}
								{isPostalBrownies && (
									<div className="space-y-3 sm:space-y-4 lg:space-y-6">
										<div className="border-t pt-3 sm:pt-4 lg:pt-6">
											<h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
												<Package className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0" />
												<span>Delivery Address</span>
											</h3>
											<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
												Please provide the complete delivery address for your
												postal brownie order.
											</p>
										</div>

										{/* Address Mode Selection */}
										<FormField
											control={form.control}
											name="addressMode"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<RadioGroup
															onValueChange={field.onChange}
															defaultValue={field.value}
															value={field.value}
															className="grid grid-cols-1 sm:grid-cols-2 gap-2"
															disabled={addressesLoading}
														>
															{addresses.length > 0 && (
																<div className="flex items-center space-x-2 p-3 border rounded-lg">
																	<RadioGroupItem
																		value="existing"
																		id={existingId}
																	/>
																	<Label
																		htmlFor={existingId}
																		className="text-sm cursor-pointer flex-1"
																	>
																		Select saved address
																	</Label>
																</div>
															)}
															<div className="flex items-center space-x-2 p-3 border rounded-lg">
																<RadioGroupItem value="new" id={newId} />
																<Label
																	htmlFor={newId}
																	className="text-sm cursor-pointer flex-1"
																>
																	Add new address
																</Label>
															</div>
														</RadioGroup>
													</FormControl>
													<FormMessage className="text-xs sm:text-sm" />
												</FormItem>
											)}
										/>

										{/* Existing Address Selection */}
										{addressMode === "existing" && (
											<FormField
												control={form.control}
												name="selectedAddressId"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-sm sm:text-base">
															Choose Address
														</FormLabel>
														<FormControl>
															{addresses.length === 0 ? (
																<div className="text-center py-8 text-muted-foreground">
																	<p className="text-sm">
																		No saved addresses found
																	</p>
																	<p className="text-xs mt-1">
																		Add a new address to continue
																	</p>
																</div>
															) : (
																<RadioGroup
																	onValueChange={(value) =>
																		field.onChange(Number.parseInt(value))
																	}
																	defaultValue={field.value?.toString()}
																	className="space-y-2"
																>
																	{addresses.map((address) => (
																		<div
																			key={address.id}
																			className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50"
																		>
																			<RadioGroupItem
																				value={address.id.toString()}
																				id={`address-${address.id}`}
																				className="mt-1"
																			/>
																			<Label
																				htmlFor={`address-${address.id}`}
																				className="text-sm cursor-pointer flex-1 leading-relaxed"
																			>
																				<div className="space-y-1">
																					<div className="font-medium">
																						{address.addressLine1}
																					</div>
																					{address.addressLine2 && (
																						<div className="text-muted-foreground">
																							{address.addressLine2}
																						</div>
																					)}
																					<div className="text-muted-foreground">
																						{address.city}, {address.state}{" "}
																						{address.zip}
																					</div>
																				</div>
																			</Label>
																			<Button
																				type="button"
																				variant="ghost"
																				size="sm"
																				onClick={(e) => {
																					e.preventDefault();
																					handleDeleteAddress(address.id);
																				}}
																				disabled={
																					deleteAddressMutation.isPending
																				}
																				className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
																				title="Delete address"
																			>
																				{deleteAddressMutation.isPending ? (
																					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
																				) : (
																					<Trash2 className="h-4 w-4" />
																				)}
																			</Button>
																		</div>
																	))}
																</RadioGroup>
															)}
														</FormControl>
														<FormMessage className="text-xs sm:text-sm" />
													</FormItem>
												)}
											/>
										)}

										{/* New Address Form */}
										{addressMode === "new" && (
											<div className="space-y-3 sm:space-y-4 lg:space-y-6">
												<div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
													<FormField
														control={form.control}
														name="addressLine1"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="text-sm sm:text-base">
																	Address Line 1 *
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="Street address, building number"
																		{...field}
																		className="text-sm sm:text-base"
																	/>
																</FormControl>
																<FormMessage className="text-xs sm:text-sm" />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="addressLine2"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="text-sm sm:text-base">
																	Address Line 2
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="Apartment, suite, unit (optional)"
																		{...field}
																		className="text-sm sm:text-base"
																	/>
																</FormControl>
																<FormMessage className="text-xs sm:text-sm" />
															</FormItem>
														)}
													/>

													<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
														<FormField
															control={form.control}
															name="city"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="text-sm sm:text-base">
																		City *
																	</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="City"
																			{...field}
																			className="text-sm sm:text-base"
																		/>
																	</FormControl>
																	<FormMessage className="text-xs sm:text-sm" />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name="state"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="text-sm sm:text-base">
																		State *
																	</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="State"
																			{...field}
																			className="text-sm sm:text-base"
																		/>
																	</FormControl>
																	<FormMessage className="text-xs sm:text-sm" />
																</FormItem>
															)}
														/>
													</div>

													<FormField
														control={form.control}
														name="zip"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="text-sm sm:text-base">
																	ZIP Code *
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="ZIP Code"
																		{...field}
																		className="text-sm sm:text-base"
																	/>
																</FormControl>
																<FormMessage className="text-xs sm:text-sm" />
															</FormItem>
														)}
													/>

													{/* Create Address Button */}
													<div className="pt-4">
														<Button
															type="button"
															variant="outline"
															onClick={handleCreateAddress}
															disabled={isCreatingAddress}
															className="w-full"
														>
															{isCreatingAddress ? (
																<>
																	<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
																	Creating Address...
																</>
															) : (
																"Create & Save Address"
															)}
														</Button>
														<p className="text-xs text-muted-foreground mt-2 text-center">
															Address will be saved and automatically selected
															for this order
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								)}

								{/* Pickup Date and Time - Only for non-postal orders */}
								{!isPostalBrownies && (
									<div className="space-y-3 sm:space-y-4 lg:space-y-6">
										<div className="border-t pt-3 sm:pt-4 lg:pt-6">
											<h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
												<CalendarIcon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0" />
												<span>Pickup Schedule</span>
											</h3>
											<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
												Select your preferred pickup date and time. Available
												Wednesday to Sunday, 12PM to 6PM. Minimum 3 days advance
												booking required.
											</p>
										</div>

										<div className="space-y-3 sm:space-y-4 lg:space-y-6">
											<FormField
												control={form.control}
												name="pickupDate"
												render={({ field }) => (
													<FormItem className="flex flex-col">
														<FormLabel className="text-sm sm:text-base font-medium">
															Pickup Date
														</FormLabel>
														<Popover>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		variant="outline"
																		className={`w-full h-10 sm:h-11 px-3 py-2 text-left font-normal text-sm sm:text-base justify-between ${
																			!field.value && "text-muted-foreground"
																		}`}
																	>
																		<span className="truncate">
																			{field.value
																				? format(field.value, "PPP")
																				: "Pick a date"}
																		</span>
																		<CalendarIcon className="h-4 w-4 opacity-50 shrink-0 ml-2" />
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent
																className="w-auto p-0 z-50"
																align="start"
																side="bottom"
																sideOffset={4}
															>
																<Calendar
																	mode="single"
																	selected={field.value}
																	onSelect={field.onChange}
																	disabled={isDateDisabled}
																	initialFocus
																	className="rounded-md border-0"
																/>
															</PopoverContent>
														</Popover>
														<FormMessage className="text-xs sm:text-sm" />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="pickupTime"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-sm sm:text-base font-medium">
															Pickup Time
														</FormLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<FormControl>
																<SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base">
																	<SelectValue placeholder="Select time" />
																</SelectTrigger>
															</FormControl>
															<SelectContent className="max-h-[200px] sm:max-h-[300px]">
																{timeSlots.map((slot) => (
																	<SelectItem
																		key={slot.value}
																		value={slot.value}
																		className="text-sm sm:text-base"
																	>
																		{slot.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage className="text-xs sm:text-sm" />
													</FormItem>
												)}
											/>
										</div>

										{/* Quick Summary for Mobile */}
										{(form.watch("pickupDate") || form.watch("pickupTime")) && (
											<div className="bg-muted/50 rounded-lg p-3 sm:p-4 lg:hidden">
												<div className="flex items-center gap-2 mb-2">
													<Clock className="h-4 w-4 text-muted-foreground shrink-0" />
													<span className="text-sm font-medium">
														Selected Pickup
													</span>
												</div>
												<div className="space-y-1">
													{form.watch("pickupDate") && (
														<p className="text-xs text-muted-foreground">
															📅{" "}
															{format(
																form.watch("pickupDate") as Date,
																"EEEE, MMM d, yyyy",
															)}
														</p>
													)}
													{form.watch("pickupTime") && (
														<p className="text-xs text-muted-foreground">
															🕐{" "}
															{
																timeSlots.find(
																	(t) => t.value === form.watch("pickupTime"),
																)?.label
															}
														</p>
													)}
												</div>
											</div>
										)}
									</div>
								)}

								<Button
									type="submit"
									className="w-full text-sm sm:text-base cursor-pointer"
									disabled={
										!ordersAllowed ||
										form.formState.isSubmitting ||
										isProcessing ||
										(isPostalBrownies && addressMode === "new") ||
										(isPostalBrownies && !selectedAddressId)
									}
									size="lg"
									variant={!ordersAllowed ? "secondary" : "default"}
								>
									{!ordersAllowed
										? "Orders Unavailable"
										: form.formState.isSubmitting || isProcessing
											? "Processing..."
											: isPostalBrownies && addressMode === "new"
												? "Create Address First"
												: isPostalBrownies && !selectedAddressId
													? "Select Address to Continue"
													: "Place Order & Pay"}
								</Button>

								{/* Helper text for postal brownies and order restrictions */}
								{(isPostalBrownies || !ordersAllowed) && (
									<div className="text-center mt-2">
										{!ordersAllowed ? (
											<p className="text-xs text-muted-foreground">
												Orders are only accepted on Mondays and Tuesdays
											</p>
										) : isPostalBrownies && addressMode === "new" ? (
											<p className="text-xs text-muted-foreground">
												Please create and save your address before placing the
												order
											</p>
										) : isPostalBrownies && !selectedAddressId ? (
											<p className="text-xs text-muted-foreground">
												Please select a delivery address to continue
											</p>
										) : null}
									</div>
								)}
							</form>
						</Form>
					</CardContent>
				</Card>

				{/* Order Summary */}
				<Card className="order-1 lg:order-2">
					<CardHeader className="pb-4 sm:pb-6">
						<CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
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
									<div className="font-medium text-sm sm:text-base shrink-0">
										{formatCurrency(Number(item.price) * item.quantity)}
									</div>
								</div>
							))}

							<div className="border-t pt-3 sm:pt-4">
								<div className="flex justify-between items-center font-medium text-base sm:text-lg">
									<span>Total:</span>
									<span>{formatCurrency(Number(total))}</span>
								</div>
							</div>

							{/* Pickup Info Display - Only for non-postal orders */}
							{!isPostalBrownies &&
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
												Date: {format(form.watch("pickupDate") as Date, "PPP")}
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
											Delivery Address
										</span>
									</div>
									{(() => {
										const selectedAddress = addresses.find(
											(addr) => addr.id === form.watch("selectedAddressId"),
										);
										if (selectedAddress) {
											return (
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
											);
										}
										return null;
									})()}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
