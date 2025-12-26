"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { CalendarIcon, Clock, Edit2, Package, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { confirm } from "@/components/confirm-dialog";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
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
import { useCakeOrderSettings } from "@/hooks/use-order-settings";
import { usePostalOrderSettings } from "@/hooks/use-postal-order-settings";
import { useSpecialsSettings } from "@/hooks/use-specials-settings";
import { useCart } from "@/lib/cart-context";
import { config } from "@/lib/config";
import {
	calculateDeliveryCost,
	isBengaluruAddress,
} from "@/lib/delivery-pricing";
import { formatLocalDate, formatYearMonth } from "@/lib/format-timestamp";
import { validatePhoneNumber } from "@/lib/phone-validation";
import { formatCurrency } from "@/lib/utils";
import type {
	RazorpayOptions,
	RazorpayOrderData,
	RazorpayResponse,
} from "@/types/razorpay";
import { PhoneEditDialog } from "./phone-edit-dialog";

interface Dessert {
	id: number;
	name: string;
	price: string;
	category: "cake" | "dessert";
	leadTimeDays: number;
	status: "available" | "unavailable";
	containsEgg: boolean;
}

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

// Fetch desserts function
const fetchDesserts = async (): Promise<Dessert[]> => {
	const response = await axios.get("/api/desserts");
	return response.data;
};

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

// Calculate date constraints based on lead time
const getDateConstraints = (leadTimeDays: number = 3) => {
	const today = new Date();
	const minDate = new Date(today);
	minDate.setDate(today.getDate() + leadTimeDays); // Minimum based on lead time

	const maxDate = new Date(today);
	maxDate.setDate(today.getDate() + 33); // Maximum 33 days from today

	return { minDate, maxDate };
};

// Check if date is disabled (Monday, Tuesday, or outside range)
const isDateDisabled = (date: Date, leadTimeDays: number = 3) => {
	const { minDate, maxDate } = getDateConstraints(leadTimeDays);
	const dayOfWeek = date.getDay();

	// Disable if before min date or after max date
	if (date < minDate || date > maxDate) {
		return true;
	}

	// Disable Monday (1) and Tuesday (2)
	return dayOfWeek === 1 || dayOfWeek === 2;
};

const createCheckoutFormSchema = (
	isPostalBrownies: boolean,
	hasSpecials: boolean = false,
	hasExistingPhone: boolean = false,
) => {
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
			.refine((phone) => validatePhoneNumber(phone, "IN").isValid, {
				message: "Please enter a valid phone number.",
			}),
		confirmPhone: hasExistingPhone
			? z.string().optional()
			: z.string().min(10, { message: "Please confirm your phone number." }),
		// Pickup fields - only required for non-postal orders
		pickupDate: isPostalBrownies
			? z.date().optional()
			: z
					.date({
						message: "Please select a pickup date.",
					})
					.refine(
						(date) => {
							// For specials, no day-of-week restrictions
							if (hasSpecials) return true;

							const dayOfWeek = date.getDay();
							// Reject Monday (1) and Tuesday (2) for cake orders
							return dayOfWeek !== 1 && dayOfWeek !== 2;
						},
						{
							message:
								"Pickup is not available on Mondays and Tuesdays. Please select Wednesday through Sunday.",
						},
					),
		pickupTime:
			isPostalBrownies || hasSpecials
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

	// Add refinement to check that phone numbers match (only when confirmPhone is required)
	return hasExistingPhone
		? baseSchema
		: baseSchema.refine((data) => data.phone === data.confirmPhone, {
				message: "Phone numbers don't match",
				path: ["confirmPhone"],
			});
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
	const [isPhoneFieldEnabled, setIsPhoneFieldEnabled] = useState(false);
	const [originalPhone, setOriginalPhone] = useState("");
	const [isPhoneEditDialogOpen, setIsPhoneEditDialogOpen] = useState(false);
	const existingId = useId();
	const newId = useId();
	const { areOrdersAllowed: ordersAllowed, settings } = useCakeOrderSettings();
	const { settings: specialsSettings } = useSpecialsSettings();

	// Fetch desserts to get lead time information
	const { data: desserts = [] } = useQuery({
		queryKey: ["desserts"],
		queryFn: fetchDesserts,
	});

	// Calculate maximum lead time from cart items
	const maxLeadTime = useMemo(() => {
		if (!desserts.length || !items.length) return 3; // Default 3 days

		const leadTimes = items
			.filter((item) => item.type === "cake-orders") // Only cake orders have lead times
			.map((item) => {
				const dessert = desserts.find((d) => d.id === item.id);
				return dessert?.leadTimeDays || 3;
			});

		return leadTimes.length > 0 ? Math.max(...leadTimes) : 3;
	}, [desserts, items]);

	// Get current month for postal order settings
	const currentMonth = formatYearMonth(new Date());
	const { getCurrentActiveSlot } = usePostalOrderSettings(currentMonth);

	// React Query hooks for address management
	const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
	const createAddressMutation = useCreateAddress();
	const deleteAddressMutation = useDeleteAddress();

	// Check if cart contains postal brownies
	const isPostalBrownies = items.some(
		(item) => item.type === "postal-brownies",
	);
	const hasSpecials = items.some((item) => item.category === "special");
	const isOrderingAllowed =
		(hasSpecials && specialsSettings?.isActive) ||
		isPostalBrownies ||
		ordersAllowed;

	const checkoutFormSchema = createCheckoutFormSchema(
		isPostalBrownies,
		hasSpecials,
		!isPhoneFieldEnabled,
	);

	const form = useForm({
		defaultValues: {
			name: name ?? "",
			email: email ?? "",
			phone: phone ?? "",
			confirmPhone: phone ?? "",
			pickupDate: undefined as Date | undefined,
			pickupTime: "",
			notes: "",
			orderType: (isPostalBrownies ? "postal-brownies" : "cake-orders") as
				| "cake-orders"
				| "postal-brownies",
			addressMode: (isPostalBrownies ? "new" : undefined) as
				| "existing"
				| "new"
				| undefined,
			selectedAddressId: undefined as number | undefined,
			addressLine1: "",
			addressLine2: "",
			city: "",
			state: "",
			zip: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = checkoutFormSchema.safeParse(value);
				if (!result.success) {
					return result.error.issues.map((issue) => ({
						message: issue.message,
						path: issue.path,
					}));
				}
				return undefined;
			},
		},
		onSubmit: async ({ value }) => {
			if (!isOrderingAllowed) {
				const isSystemDisabled = !settings?.isActive;

				if (isSystemDisabled) {
					toast.error("Cake order system is currently disabled");
				} else {
					toast.error("Cake orders are only accepted on allowed days");
				}
				return;
			}

			try {
				setIsProcessing(true);

				// Update phone number if it has changed and field was enabled
				if (isPhoneFieldEnabled && value.phone !== originalPhone) {
					setProcessingStep("Updating contact information...");
					try {
						await updateUserPhone(value.phone);
					} catch (error) {
						console.error("Failed to update phone number:", error);
						toast.error("Failed to update phone number. Please try again.");
						setIsProcessing(false);
						setProcessingStep("");
						return;
					}
				}

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
							name: value.name,
							email: value.email,
							phone: value.phone,
							pickupDate: value.pickupDate
								? value.pickupDate.toISOString()
								: undefined,
							pickupTime: value.pickupTime || undefined,
							notes: value.notes ?? "",
							items: items.map((item) => ({
								id: item.id,
								name: item.name,
								price: item.price,
								quantity: item.quantity,
								category: item.category,
							})),
							orderType: hasSpecials
								? "specials"
								: isPostalBrownies
									? "postal-brownies"
									: "cake-orders",
							total: finalTotal, // Include delivery cost for postal brownies
							deliveryCost: deliveryCost, // Send delivery cost separately for transparency
							// Include selected address ID for postal brownies
							selectedAddressId: isPostalBrownies
								? value.selectedAddressId
								: undefined,
						}),
					});

					if (!orderResponse.ok) {
						const errorData = await orderResponse.json();
						throw new Error(errorData.error || "Failed to create order");
					}

					const newOrderData = await orderResponse.json();

					if (!newOrderData.success) {
						throw new Error(newOrderData.error || "Failed to create order");
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
				await handlePayment(value, orderId, orderData);
			} catch (error) {
				console.error("Error processing order:", error);
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to process order. Please try again.";
				toast.error(errorMessage);
				setIsProcessing(false);
				setProcessingStep("");
			}
		},
	});

	// Watch form values
	const addressMode = useStore(form.store, (state) => state.values.addressMode);
	const newAddressCity = useStore(form.store, (state) => state.values.city);
	const newAddressZip = useStore(form.store, (state) => state.values.zip);
	const selectedAddressId = useStore(
		form.store,
		(state) => state.values.selectedAddressId,
	);
	const pickupDate = useStore(form.store, (state) => state.values.pickupDate);
	const pickupTime = useStore(form.store, (state) => state.values.pickupTime);

	// Calculate delivery cost and check for Bengaluru discount
	const { deliveryCost, isDiscountApplied } = isPostalBrownies
		? (() => {
				let currentAddress = null;

				// If using existing address
				if (addressMode === "existing" && selectedAddressId) {
					const selectedAddress = addresses.find(
						(addr) => addr.id === selectedAddressId,
					);
					if (selectedAddress) {
						currentAddress = {
							city: selectedAddress.city,
							zip: selectedAddress.zip,
						};
					}
				}

				// If creating new address and both city and zip are entered
				if (addressMode === "new" && newAddressCity && newAddressZip) {
					currentAddress = {
						city: newAddressCity,
						zip: newAddressZip,
					};
				}

				if (currentAddress) {
					const cost = calculateDeliveryCost(currentAddress);
					const isDiscount = isBengaluruAddress(currentAddress);
					return { deliveryCost: cost, isDiscountApplied: isDiscount };
				}

				// Default delivery cost
				return {
					deliveryCost: config.postalDeliveryCost,
					isDiscountApplied: false,
				};
			})()
		: { deliveryCost: 0, isDiscountApplied: false };

	const finalTotal = Number(total) + deliveryCost;

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

	// Initialize phone field enablement based on whether phone is empty
	useEffect(() => {
		const isEmpty = !phone || phone.trim() === "";
		setIsPhoneFieldEnabled(isEmpty);
		setOriginalPhone(phone || "");
		// Also set confirmPhone when initializing
		if (!isEmpty) {
			form.setFieldValue("confirmPhone", phone);
		}
	}, [phone, form]);

	// Set default address mode when addresses are loaded
	useEffect(() => {
		if (isPostalBrownies) {
			if (addresses.length > 0 && !addressMode) {
				form.setFieldValue("addressMode", "existing");
				// If only one address, auto-select it
				if (addresses.length === 1 && !selectedAddressId) {
					form.setFieldValue("selectedAddressId", addresses[0].id);
				}
			} else if (addresses.length === 0 && addressMode === "existing") {
				// If no addresses left and in existing mode, switch to new mode
				form.setFieldValue("addressMode", "new");
				form.setFieldValue("selectedAddressId", undefined);
			}
		}
	}, [isPostalBrownies, addresses, form, addressMode, selectedAddressId]);

	// Handle address creation separately
	const handleCreateAddress = async () => {
		const addressData = {
			addressLine1: form.getFieldValue("addressLine1") || "",
			addressLine2: form.getFieldValue("addressLine2") || "",
			city: form.getFieldValue("city") || "",
			state: form.getFieldValue("state") || "",
			zip: form.getFieldValue("zip") || "",
		};

		// Validate address fields using Zod schema
		const validation = addressSchema.safeParse(addressData);
		if (!validation.success) {
			const errors = validation.error.issues;
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
			form.setFieldValue("selectedAddressId", newAddress.id);
			form.setFieldValue("addressMode", "existing");

			// Clear the new address form fields
			form.setFieldValue("addressLine1", "");
			form.setFieldValue("addressLine2", "");
			form.setFieldValue("city", "");
			form.setFieldValue("state", "");
			form.setFieldValue("zip", "");

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
		const confirmed = await confirm({
			title: "Delete Address",
			description:
				"Are you sure you want to delete this address? This action cannot be undone.",
		});

		if (!confirmed) return;

		try {
			await deleteAddressMutation.mutateAsync(addressId);

			// If the deleted address was selected, clear the selection
			if (selectedAddressId === addressId) {
				form.setFieldValue("selectedAddressId", undefined);
			}
		} catch (error) {
			console.error("Error deleting address:", error);
		}
	};

	// Update user phone number
	const updateUserPhone = async (newPhone: string) => {
		try {
			const response = await fetch("/api/user/profile", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					phone: newPhone,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update phone number");
			}

			return await response.json();
		} catch (error) {
			console.error("Error updating phone number:", error);
			throw error;
		}
	};

	// Handle phone edit dialog save
	const handlePhoneEditSave = async (newPhone: string) => {
		try {
			await updateUserPhone(newPhone);
			form.setFieldValue("phone", newPhone);
			form.setFieldValue("confirmPhone", newPhone);
			setOriginalPhone(newPhone);
			setIsPhoneFieldEnabled(false);
		} catch (error) {
			console.error("Error saving phone number:", error);
			throw error;
		}
	};

	const handlePayment = async (
		orderData: {
			name: string;
			email: string;
			phone: string;
		},
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

			<FadeIn>
				<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">
					Checkout
				</h1>
			</FadeIn>

			{/* Show order restriction banner when orders are not allowed */}
			{!isOrderingAllowed && <OrderRestrictionBanner />}

			<FadeIn
				delay={0.1}
				className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
			>
				{/* Customer Information */}
				<Card className="order-2 lg:order-1">
					<CardHeader className="pb-4 sm:pb-6">
						<CardTitle className="text-lg sm:text-xl">
							Customer Information
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className={`space-y-4 sm:space-y-6 ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
						>
							{/* Hidden orderType field */}
							<input
								type="hidden"
								name="orderType"
								value={isPostalBrownies ? "postal-brownies" : "cake-orders"}
							/>

							<form.Field
								name="name"
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(field) => {
									const hasErrors =
										field.state.meta.errors &&
										field.state.meta.errors.length > 0;
									return (
										<Field data-invalid={hasErrors}>
											<FieldLabel
												htmlFor={field.name}
												className="text-sm sm:text-base"
											>
												Full Name
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Enter your full name"
												className="text-sm sm:text-base"
												disabled
												readOnly
												tabIndex={-1}
											/>
											{hasErrors && (
												<FieldError
													errors={field.state.meta.errors}
													className="text-xs sm:text-sm"
												/>
											)}
										</Field>
									);
								}}
							/>

							<form.Field
								name="email"
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(field) => {
									const hasErrors =
										field.state.meta.errors &&
										field.state.meta.errors.length > 0;
									return (
										<Field data-invalid={hasErrors}>
											<FieldLabel
												htmlFor={field.name}
												className="text-sm sm:text-base"
											>
												Email Address
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="email"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Enter your email address"
												className="text-sm sm:text-base"
												readOnly
												disabled
												tabIndex={-1}
											/>
											{hasErrors && (
												<FieldError
													errors={field.state.meta.errors}
													className="text-xs sm:text-sm"
												/>
											)}
										</Field>
									);
								}}
							/>

							{/* Phone fields - Show differently based on whether user has phone */}
							{isPhoneFieldEnabled ? (
								// First-time user or user with no phone - show both fields
								<>
									<form.Field
										name="phone"
										// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
										children={(field) => {
											const hasErrors =
												field.state.meta.errors &&
												field.state.meta.errors.length > 0;
											return (
												<Field data-invalid={hasErrors}>
													<FieldLabel
														htmlFor={field.name}
														className="text-sm sm:text-base"
													>
														Phone Number
													</FieldLabel>
													<Input
														id={field.name}
														name={field.name}
														type="tel"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="Enter your phone number"
														className="text-sm sm:text-base"
														readOnly={isProcessing}
														disabled={isProcessing}
													/>
													{hasErrors && (
														<FieldError
															errors={field.state.meta.errors}
															className="text-xs sm:text-sm"
														/>
													)}
												</Field>
											);
										}}
									/>

									<form.Field
										name="confirmPhone"
										// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
										children={(field) => {
											const hasErrors =
												field.state.meta.errors &&
												field.state.meta.errors.length > 0;
											return (
												<Field data-invalid={hasErrors}>
													<FieldLabel
														htmlFor={field.name}
														className="text-sm sm:text-base"
													>
														Confirm Phone Number
													</FieldLabel>
													<Input
														id={field.name}
														name={field.name}
														type="tel"
														value={field.state.value ?? ""}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="Re-enter your phone number"
														className="text-sm sm:text-base"
														readOnly={isProcessing}
														disabled={isProcessing}
														onPaste={(e) => {
															e.preventDefault();
															return false;
														}}
													/>
													<FieldDescription className="text-xs sm:text-sm">
														Please re-enter your phone number to confirm
													</FieldDescription>
													{hasErrors && (
														<FieldError
															errors={field.state.meta.errors}
															className="text-xs sm:text-sm"
														/>
													)}
												</Field>
											);
										}}
									/>
								</>
							) : (
								// Repeat user with phone - show phone with edit button
								<form.Field
									name="phone"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const hasErrors =
											field.state.meta.errors &&
											field.state.meta.errors.length > 0;
										return (
											<Field data-invalid={hasErrors}>
												<FieldLabel
													htmlFor={field.name}
													className="text-sm sm:text-base"
												>
													Phone Number
												</FieldLabel>
												<div className="flex gap-2">
													<Input
														id={field.name}
														name={field.name}
														type="tel"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														className="text-sm sm:text-base"
														readOnly
														disabled
														tabIndex={-1}
													/>
													<Button
														type="button"
														variant="outline"
														size="icon"
														onClick={() => setIsPhoneEditDialogOpen(true)}
														disabled={isProcessing}
														title="Edit phone number"
													>
														<Edit2 className="h-4 w-4" />
													</Button>
												</div>
												{hasErrors && (
													<FieldError
														errors={field.state.meta.errors}
														className="text-xs sm:text-sm"
													/>
												)}
											</Field>
										);
									}}
								/>
							)}

							{!hasSpecials && (
								<form.Field
									name="notes"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const hasErrors =
											field.state.meta.errors &&
											field.state.meta.errors.length > 0;
										return (
											<Field data-invalid={hasErrors}>
												<FieldLabel
													htmlFor={field.name}
													className="text-sm sm:text-base"
												>
													{isPostalBrownies
														? "Message (Optional)"
														: "Message on Cake"}
												</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value ?? ""}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder={
														isPostalBrownies
															? "Special delivery instructions or notes"
															: "Keep it short and sweet"
													}
													className="text-sm sm:text-base"
													maxLength={isPostalBrownies ? 250 : 25}
												/>
												<FieldDescription className="text-xs sm:text-sm text-muted-foreground">
													Maximum {isPostalBrownies ? 250 : 25} characters
												</FieldDescription>
												{hasErrors && (
													<FieldError
														errors={field.state.meta.errors}
														className="text-xs sm:text-sm"
													/>
												)}
											</Field>
										);
									}}
								/>
							)}

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
									<form.Field
										name="addressMode"
										// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
										children={(field) => {
											const hasErrors =
												field.state.meta.errors &&
												field.state.meta.errors.length > 0;
											return (
												<Field data-invalid={hasErrors}>
													<RadioGroup
														onValueChange={(value) =>
															field.handleChange(value as "existing" | "new")
														}
														value={field.state.value}
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
													{hasErrors && (
														<FieldError
															errors={field.state.meta.errors}
															className="text-xs sm:text-sm"
														/>
													)}
												</Field>
											);
										}}
									/>

									{/* Existing Address Selection */}
									{addressMode === "existing" && (
										<form.Field
											name="selectedAddressId"
											// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
											children={(field) => {
												const hasErrors =
													field.state.meta.errors &&
													field.state.meta.errors.length > 0;
												return (
													<Field data-invalid={hasErrors}>
														<FieldLabel className="text-sm sm:text-base">
															Choose Address
														</FieldLabel>
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
																	field.handleChange(Number.parseInt(value))
																}
																value={field.state.value?.toString()}
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
																			onClick={() => {
																				handleDeleteAddress(address.id);
																			}}
																			disabled={deleteAddressMutation.isPending}
																			title="Delete address"
																		>
																			{deleteAddressMutation.isPending ? (
																				<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
																			) : (
																				<Trash2 className="h-4 w-4 text-primary" />
																			)}
																		</Button>
																	</div>
																))}
															</RadioGroup>
														)}
														{hasErrors && (
															<FieldError
																errors={field.state.meta.errors}
																className="text-xs sm:text-sm"
															/>
														)}
													</Field>
												);
											}}
										/>
									)}

									{/* New Address Form */}
									{addressMode === "new" && (
										<div className="space-y-3 sm:space-y-4 lg:space-y-6">
											<div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
												<form.Field
													name="addressLine1"
													// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
													children={(field) => {
														const hasErrors =
															field.state.meta.errors &&
															field.state.meta.errors.length > 0;
														return (
															<Field data-invalid={hasErrors}>
																<FieldLabel
																	htmlFor={field.name}
																	className="text-sm sm:text-base"
																>
																	Address Line 1 *
																</FieldLabel>
																<Input
																	id={field.name}
																	name={field.name}
																	value={field.state.value ?? ""}
																	onBlur={field.handleBlur}
																	onChange={(e) =>
																		field.handleChange(e.target.value)
																	}
																	placeholder="Street address, building number"
																	className="text-sm sm:text-base"
																/>
																{hasErrors && (
																	<FieldError
																		errors={field.state.meta.errors}
																		className="text-xs sm:text-sm"
																	/>
																)}
															</Field>
														);
													}}
												/>

												<form.Field
													name="addressLine2"
													// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
													children={(field) => {
														const hasErrors =
															field.state.meta.errors &&
															field.state.meta.errors.length > 0;
														return (
															<Field data-invalid={hasErrors}>
																<FieldLabel
																	htmlFor={field.name}
																	className="text-sm sm:text-base"
																>
																	Address Line 2
																</FieldLabel>
																<Input
																	id={field.name}
																	name={field.name}
																	value={field.state.value ?? ""}
																	onBlur={field.handleBlur}
																	onChange={(e) =>
																		field.handleChange(e.target.value)
																	}
																	placeholder="Apartment, suite, unit (optional)"
																	className="text-sm sm:text-base"
																/>
																{hasErrors && (
																	<FieldError
																		errors={field.state.meta.errors}
																		className="text-xs sm:text-sm"
																	/>
																)}
															</Field>
														);
													}}
												/>

												<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
													<form.Field
														name="city"
														// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
														children={(field) => {
															const hasErrors =
																field.state.meta.errors &&
																field.state.meta.errors.length > 0;
															return (
																<Field data-invalid={hasErrors}>
																	<FieldLabel
																		htmlFor={field.name}
																		className="text-sm sm:text-base"
																	>
																		City *
																	</FieldLabel>
																	<Input
																		id={field.name}
																		name={field.name}
																		value={field.state.value ?? ""}
																		onBlur={field.handleBlur}
																		onChange={(e) =>
																			field.handleChange(e.target.value)
																		}
																		placeholder="City"
																		className="text-sm sm:text-base"
																	/>
																	{hasErrors && (
																		<FieldError
																			errors={field.state.meta.errors}
																			className="text-xs sm:text-sm"
																		/>
																	)}
																</Field>
															);
														}}
													/>

													<form.Field
														name="state"
														// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
														children={(field) => {
															const hasErrors =
																field.state.meta.errors &&
																field.state.meta.errors.length > 0;
															return (
																<Field data-invalid={hasErrors}>
																	<FieldLabel
																		htmlFor={field.name}
																		className="text-sm sm:text-base"
																	>
																		State *
																	</FieldLabel>
																	<Input
																		id={field.name}
																		name={field.name}
																		value={field.state.value ?? ""}
																		onBlur={field.handleBlur}
																		onChange={(e) =>
																			field.handleChange(e.target.value)
																		}
																		placeholder="State"
																		className="text-sm sm:text-base"
																	/>
																	{hasErrors && (
																		<FieldError
																			errors={field.state.meta.errors}
																			className="text-xs sm:text-sm"
																		/>
																	)}
																</Field>
															);
														}}
													/>
												</div>

												<form.Field
													name="zip"
													// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
													children={(field) => {
														const hasErrors =
															field.state.meta.errors &&
															field.state.meta.errors.length > 0;
														return (
															<Field data-invalid={hasErrors}>
																<FieldLabel
																	htmlFor={field.name}
																	className="text-sm sm:text-base"
																>
																	ZIP Code *
																</FieldLabel>
																<Input
																	id={field.name}
																	name={field.name}
																	value={field.state.value ?? ""}
																	onBlur={field.handleBlur}
																	onChange={(e) =>
																		field.handleChange(e.target.value)
																	}
																	placeholder="ZIP Code"
																	className="text-sm sm:text-base"
																/>
																{hasErrors && (
																	<FieldError
																		errors={field.state.meta.errors}
																		className="text-xs sm:text-sm"
																	/>
																)}
															</Field>
														);
													}}
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
														Address will be saved and automatically selected for
														this order
													</p>
												</div>
											</div>
										</div>
									)}
								</div>
							)}

							{/* Pickup Date Selection for Specials Orders */}
							{!isPostalBrownies && hasSpecials && specialsSettings && (
								<div className="space-y-3 sm:space-y-4 lg:space-y-6">
									<div className="border-t pt-3 sm:pt-4 lg:pt-6">
										<h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
											<CalendarIcon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0" />
											<span>Pickup Date Selection</span>
										</h3>
										<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
											Select your preferred pickup date from the available
											range. Pickup time: {specialsSettings.pickupStartTime} -{" "}
											{specialsSettings.pickupEndTime}
										</p>
									</div>
									<div className="space-y-3 sm:space-y-4 lg:space-y-6">
										<form.Field
											name="pickupDate"
											// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
											children={(field) => {
												const hasErrors =
													field.state.meta.errors &&
													field.state.meta.errors.length > 0;
												return (
													<Field
														data-invalid={hasErrors}
														className="flex flex-col"
													>
														<FieldLabel className="text-sm sm:text-base font-medium">
															Pickup Date (Available:{" "}
															{formatLocalDate(
																new Date(specialsSettings.pickupStartDate),
															)}{" "}
															to{" "}
															{formatLocalDate(
																new Date(specialsSettings.pickupEndDate),
															)}
															)
														</FieldLabel>
														<Popover>
															<PopoverTrigger asChild>
																<Button
																	variant="outline"
																	className={`w-full h-10 sm:h-11 px-3 py-2 text-left font-normal text-sm sm:text-base justify-between ${
																		!field.state.value &&
																		"text-muted-foreground"
																	}`}
																>
																	<span className="truncate">
																		{field.state.value
																			? formatLocalDate(field.state.value)
																			: "Select a pickup date"}
																	</span>
																	<CalendarIcon className="h-4 w-4 opacity-50 shrink-0 ml-2" />
																</Button>
															</PopoverTrigger>
															<PopoverContent
																className="w-auto p-0 z-50"
																align="start"
																side="bottom"
																sideOffset={4}
															>
																<Calendar
																	mode="single"
																	selected={field.state.value}
																	onSelect={field.handleChange}
																	disabled={(date) => {
																		const startDate = new Date(
																			specialsSettings.pickupStartDate,
																		);
																		const endDate = new Date(
																			specialsSettings.pickupEndDate,
																		);
																		startDate.setHours(0, 0, 0, 0);
																		endDate.setHours(23, 59, 59, 999);
																		const compareDate = new Date(date);
																		compareDate.setHours(12, 0, 0, 0);
																		return (
																			compareDate < startDate ||
																			compareDate > endDate
																		);
																	}}
																	initialFocus
																	className="rounded-md border-0"
																/>
															</PopoverContent>
														</Popover>
														{hasErrors && (
															<FieldError
																errors={field.state.meta.errors}
																className="text-xs sm:text-sm"
															/>
														)}
													</Field>
												);
											}}
										/>
									</div>
								</div>
							)}

							{/* Pickup Date and Time - Only for non-postal orders */}
							{!isPostalBrownies && !hasSpecials && (
								<div className="space-y-3 sm:space-y-4 lg:space-y-6">
									<div className="border-t pt-3 sm:pt-4 lg:pt-6">
										<h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
											<CalendarIcon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0" />
											<span>Pickup Schedule</span>
										</h3>
										<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
											Select your preferred pickup date and time. Available
											Wednesday to Sunday, 12PM to 6PM. Minimum {maxLeadTime}{" "}
											day{maxLeadTime > 1 ? "s" : ""} advance booking required
											based on your cart items.
										</p>
									</div>

									<div className="space-y-3 sm:space-y-4 lg:space-y-6">
										<form.Field
											name="pickupDate"
											// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
											children={(field) => {
												const hasErrors =
													field.state.meta.errors &&
													field.state.meta.errors.length > 0;
												return (
													<Field
														data-invalid={hasErrors}
														className="flex flex-col"
													>
														<FieldLabel className="text-sm sm:text-base font-medium">
															Pickup Date
														</FieldLabel>
														<Popover>
															<PopoverTrigger asChild>
																<Button
																	variant="outline"
																	className={`w-full h-10 sm:h-11 px-3 py-2 text-left font-normal text-sm sm:text-base justify-between ${
																		!field.state.value &&
																		"text-muted-foreground"
																	}`}
																>
																	<span className="truncate">
																		{field.state.value
																			? formatLocalDate(field.state.value)
																			: "Pick a date"}
																	</span>
																	<CalendarIcon className="h-4 w-4 opacity-50 shrink-0 ml-2" />
																</Button>
															</PopoverTrigger>
															<PopoverContent
																className="w-auto p-0 z-50"
																align="start"
																side="bottom"
																sideOffset={4}
															>
																<Calendar
																	mode="single"
																	selected={field.state.value}
																	onSelect={field.handleChange}
																	disabled={(date) =>
																		isDateDisabled(date, maxLeadTime)
																	}
																	initialFocus
																	className="rounded-md border-0"
																/>
															</PopoverContent>
														</Popover>
														{hasErrors && (
															<FieldError
																errors={field.state.meta.errors}
																className="text-xs sm:text-sm"
															/>
														)}
													</Field>
												);
											}}
										/>

										<form.Field
											name="pickupTime"
											// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
											children={(field) => {
												const hasErrors =
													field.state.meta.errors &&
													field.state.meta.errors.length > 0;
												return (
													<Field data-invalid={hasErrors}>
														<FieldLabel className="text-sm sm:text-base font-medium">
															Pickup Time
														</FieldLabel>
														<Select
															onValueChange={field.handleChange}
															value={field.state.value}
														>
															<SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base">
																<SelectValue placeholder="Select time" />
															</SelectTrigger>
															<SelectContent className="max-h-50 sm:max-h-75">
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
														{hasErrors && (
															<FieldError
																errors={field.state.meta.errors}
																className="text-xs sm:text-sm"
															/>
														)}
													</Field>
												);
											}}
										/>
									</div>

									{/* Quick Summary for Mobile */}
									{(pickupDate || pickupTime) && (
										<div className="bg-muted/50 rounded-lg p-3 sm:p-4 lg:hidden">
											<div className="flex items-center gap-2 mb-2">
												<Clock className="h-4 w-4 text-muted-foreground shrink-0" />
												<span className="text-sm font-medium">
													Selected Pickup
												</span>
											</div>
											<div className="space-y-1">
												{pickupDate && (
													<p className="text-xs text-muted-foreground">
														📅 {format(pickupDate, "EEEE, MMM d, yyyy")}
													</p>
												)}
												{pickupTime && (
													<p className="text-xs text-muted-foreground">
														🕐{" "}
														{
															timeSlots.find((t) => t.value === pickupTime)
																?.label
														}
													</p>
												)}
											</div>
										</div>
									)}
								</div>
							)}

							<form.Subscribe
								selector={(state) => state.isSubmitting}
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(formIsSubmitting) => (
									<Button
										type="submit"
										className="w-full text-sm sm:text-base cursor-pointer"
										disabled={
											!isOrderingAllowed ||
											formIsSubmitting ||
											isProcessing ||
											(isPostalBrownies && addressMode === "new") ||
											(isPostalBrownies && !selectedAddressId)
										}
										size="lg"
										variant={!isOrderingAllowed ? "secondary" : "default"}
									>
										{!isOrderingAllowed
											? "Orders Unavailable"
											: formIsSubmitting || isProcessing
												? "Processing..."
												: isPostalBrownies && addressMode === "new"
													? "Create Address First"
													: isPostalBrownies && !selectedAddressId
														? "Select Address to Continue"
														: "Place Order & Pay"}
									</Button>
								)}
							/>

							{/* Helper text for postal brownies and order restrictions */}
							{(isPostalBrownies || !isOrderingAllowed) && (
								<div className="text-center mt-2">
									{!isOrderingAllowed ? (
										<p className="text-xs text-muted-foreground">
											{!settings?.isActive
												? "Cake order system is currently disabled"
												: "Orders are only accepted on allowed days"}
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
					</CardContent>
				</Card>

				{/* Order Summary */}
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
										{formatLocalDate(
											new Date(specialsSettings.pickupStartDate),
										)}{" "}
										to{" "}
										{formatLocalDate(new Date(specialsSettings.pickupEndDate))}{" "}
										at {specialsSettings.pickupStartTime} -{" "}
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
														isDiscountApplied
															? "text-green-600 font-medium"
															: ""
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
							{!isPostalBrownies && hasSpecials && pickupDate && (
								<div className="border-t pt-3 sm:pt-4">
									<div className="flex items-center gap-2 mb-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm sm:text-base font-medium">
											Selected Pickup Date
										</span>
									</div>
									<p className="text-sm sm:text-base text-muted-foreground">
										{formatLocalDate(pickupDate)} at{" "}
										{specialsSettings?.pickupStartTime} -{" "}
										{specialsSettings?.pickupEndTime}
									</p>
								</div>
							)}

							{/* Pickup Info Display - Only for non-postal orders and non-specials */}
							{!isPostalBrownies &&
								!hasSpecials &&
								(pickupDate || pickupTime) && (
									<div className="border-t pt-3 sm:pt-4">
										<div className="flex items-center gap-2 mb-2">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm sm:text-base font-medium">
												Pickup Details
											</span>
										</div>
										{pickupDate && (
											<p className="text-xs sm:text-sm text-muted-foreground">
												Date: {formatLocalDate(pickupDate)}
											</p>
										)}
										{pickupTime && (
											<p className="text-xs sm:text-sm text-muted-foreground">
												Time:{" "}
												{timeSlots.find((t) => t.value === pickupTime)?.label}
											</p>
										)}
									</div>
								)}

							{/* Delivery Address Display - Only for postal brownies */}
							{isPostalBrownies && selectedAddressId && (
								<div className="border-t pt-3 sm:pt-4">
									<div className="flex items-center gap-2 mb-2">
										<Package className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm sm:text-base font-medium">
											Delivery Information
										</span>
									</div>
									{(() => {
										const selectedAddress = addresses.find(
											(addr) => addr.id === selectedAddressId,
										);
										const currentSlot = getCurrentActiveSlot();

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
			</FadeIn>

			{/* Phone Edit Dialog */}
			<PhoneEditDialog
				isOpen={isPhoneEditDialogOpen}
				onClose={() => setIsPhoneEditDialogOpen(false)}
				currentPhone={form.getFieldValue("phone")}
				onSave={handlePhoneEditSave}
			/>
		</div>
	);
}
