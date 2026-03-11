"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { AddressSelector } from "@/components/checkout/address-selector";
import { ContactInfoForm } from "@/components/checkout/contact-info-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import {
	PickupScheduler,
	TIME_SLOTS,
} from "@/components/checkout/pickup-scheduler";
import { ProcessingOverlay } from "@/components/checkout/processing-overlay";
import { confirm } from "@/components/confirm-dialog";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getToastErrorMessage } from "@/components/ui/error-state";
import OrderRestrictionBanner from "@/components/ui/order-restriction-banner";
import {
	useAddresses,
	useCreateAddress,
	useDeleteAddress,
} from "@/hooks/use-addresses";
import { useCakeOrderSettings } from "@/hooks/use-order-settings";
import { usePostalOrderSettings } from "@/hooks/use-postal-order-settings";
import { useRazorpay } from "@/hooks/use-razorpay";
import { useSpecialsSettings } from "@/hooks/use-specials-settings";
import { useCart } from "@/lib/cart-context";
import { config } from "@/lib/config";
import {
	calculateDeliveryCost,
	isBengaluruAddress,
} from "@/lib/delivery-pricing";
import { formatYearMonth } from "@/lib/format-timestamp";
import { validatePhoneNumber } from "@/lib/phone-validation";
import { cn } from "@/lib/utils";
import type {
	RazorpayOptions,
	RazorpayOrderData,
	RazorpayResponse,
} from "@/types/razorpay";
import { PhoneEditDialog } from "./phone-edit-dialog";

// ─── Types ──────────────────────────────────────────────────────

interface Dessert {
	id: number;
	name: string;
	price: string;
	category: "cake" | "dessert";
	leadTimeDays: number;
	status: "available" | "unavailable";
	containsEgg: boolean;
}

// Window.Razorpay type is declared in use-razorpay.ts

// ─── Data fetching ──────────────────────────────────────────────

const fetchDesserts = async (): Promise<Dessert[]> => {
	const response = await axios.get("/api/desserts");
	return response.data;
};

// ─── Form schema ────────────────────────────────────────────────

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

// ─── Component ──────────────────────────────────────────────────

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
					toast.error(
						"Our cake order system is currently paused. Please check back later or contact us for more info.",
					);
				} else {
					toast.error(
						"We only accept cake orders on specific days. Check the banner above for the next available ordering day.",
					);
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
						toast.error(getToastErrorMessage(error, "update-phone"));
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
						throw new Error(
							errorData.error ||
								"We couldn't create your order. Please check your details and try again.",
						);
					}

					const newOrderData = await orderResponse.json();

					if (!newOrderData.success) {
						throw new Error(
							newOrderData.error ||
								"We couldn't create your order. Please check your details and try again.",
						);
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
				toast.error(getToastErrorMessage(error, "create-order"));
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
	const nameValue = useStore(form.store, (state) => state.values.name);
	const emailValue = useStore(form.store, (state) => state.values.email);
	const phoneValue = useStore(form.store, (state) => state.values.phone);

	// Wizard step state
	const [step, setStep] = useState<1 | 2 | 3>(1);

	// Step validation
	const isStep1Valid =
		nameValue &&
		nameValue.length >= 2 &&
		emailValue &&
		emailValue.includes("@") &&
		phoneValue &&
		phoneValue.length >= 10;

	// Note: For existing address, we just need an ID. For new address, it has to be created (which auto-selects).
	// Therefore, as long as it's a postal order, they must have selected an address ID to proceed.
	const isStep2Valid = isPostalBrownies
		? !!selectedAddressId
		: hasSpecials
			? !!pickupDate
			: !!(pickupDate && pickupTime);

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

	// Load Razorpay script using shared hook
	const { openCheckout: openRazorpayCheckout } = useRazorpay();

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

	// ─── Handlers ──────────────────────────────────────────────

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
			toast.error(`Please fix the address: ${errorMessage}`);
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
			toast.error(getToastErrorMessage(error, "create-address"));
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
					toast.error(getToastErrorMessage(error, "verify-payment"));
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

		openRazorpayCheckout(options);
	};

	// ─── Render ─────────────────────────────────────────────────

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
		<div className="container mx-auto py-3 sm:py-6 lg:py-8 px-3 sm:px-4 relative pb-24 lg:pb-8">
			{/* Loading Overlay */}
			<ProcessingOverlay
				isProcessing={isProcessing}
				stepDescription={processingStep}
			/>

			<FadeIn>
				<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-6 lg:mb-8">
					Checkout
				</h1>
			</FadeIn>

			{/* Show order restriction banner when orders are not allowed */}
			{!isOrderingAllowed && <OrderRestrictionBanner />}

			<FadeIn
				delay={0.1}
				className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8"
			>
				{/* Wizard Progress Header (Mobile Only) */}
				<div className="lg:hidden col-span-1 flex items-center justify-between px-1 mb-2">
					<div className="flex flex-col items-center gap-1">
						<div
							className={cn(
								"w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
								step >= 1
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground",
							)}
						>
							{step > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
						</div>
						<span
							className={cn(
								"text-[10px] uppercase font-semibold",
								step >= 1 ? "text-primary" : "text-muted-foreground",
							)}
						>
							Details
						</span>
					</div>
					<div
						className={cn(
							"h-0.5 flex-1 mx-2",
							step >= 2 ? "bg-primary" : "bg-muted",
						)}
					/>
					<div className="flex flex-col items-center gap-1">
						<div
							className={cn(
								"w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
								step >= 2
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground",
							)}
						>
							{step > 2 ? <Check className="w-3.5 h-3.5" /> : "2"}
						</div>
						<span
							className={cn(
								"text-[10px] uppercase font-semibold",
								step >= 2 ? "text-primary" : "text-muted-foreground",
							)}
						>
							{isPostalBrownies ? "Delivery" : "Pickup"}
						</span>
					</div>
					<div
						className={cn(
							"h-0.5 flex-1 mx-2",
							step >= 3 ? "bg-primary" : "bg-muted",
						)}
					/>
					<div className="flex flex-col items-center gap-1">
						<div
							className={cn(
								"w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
								step >= 3
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground",
							)}
						>
							3
						</div>
						<span
							className={cn(
								"text-[10px] uppercase font-semibold",
								step >= 3 ? "text-primary" : "text-muted-foreground",
							)}
						>
							Review
						</span>
					</div>
				</div>

				{/* Main Flow (Left/Center) */}
				<Card
					className={cn(
						"order-2 lg:order-1",
						"lg:col-span-7 xl:col-span-8",
						step === 3 && "hidden lg:block", // Hide form column entirely on mobile step 3
					)}
				>
					<CardContent className="pt-4 sm:pt-6">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className={`space-y-3 sm:space-y-5 ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
						>
							{/* Hidden orderType field */}
							<input
								type="hidden"
								name="orderType"
								value={isPostalBrownies ? "postal-brownies" : "cake-orders"}
							/>

							{/* Step 1: Contact Info */}
							<div className={cn("space-y-4", step !== 1 && "hidden lg:block")}>
								<div className="hidden lg:flex items-center gap-2 mb-4 pb-2 border-b">
									<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
										1
									</div>
									<h2 className="text-lg font-semibold">Contact Information</h2>
								</div>

								<ContactInfoForm
									name={name}
									email={email}
									isPhoneFieldEnabled={isPhoneFieldEnabled}
									isProcessing={isProcessing}
									form={form}
									hasSpecials={hasSpecials}
									isPostalBrownies={isPostalBrownies}
									onOpenPhoneEdit={() => setIsPhoneEditDialogOpen(true)}
								/>

								{/* Mobile Continue Button */}
								<div className="lg:hidden mt-6 pt-4 border-t">
									<Button
										type="button"
										className="w-full"
										disabled={!isStep1Valid}
										onClick={() => {
											document.documentElement.scrollIntoView({
												behavior: "smooth",
												block: "start",
											});
											setStep(2);
										}}
									>
										Continue to {isPostalBrownies ? "Delivery" : "Pickup"}
										<ChevronRight className="w-4 h-4 ml-1.5" />
									</Button>
								</div>
							</div>

							{/* Step 2: Fulfillment */}
							<div className={cn("space-y-4", step !== 2 && "hidden lg:block")}>
								<div className="hidden lg:flex items-center gap-2 mb-4 mt-8 pb-2 border-b">
									<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
										2
									</div>
									<h2 className="text-lg font-semibold">
										{isPostalBrownies
											? "Delivery Information"
											: "Pickup Details"}
									</h2>
								</div>

								<div className="lg:hidden mb-4">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setStep(1)}
										className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
									>
										<ChevronLeft className="w-4 h-4 mr-1" /> Back to Details
									</Button>
								</div>

								{/* Address Fields - Only for postal brownies */}
								{isPostalBrownies && (
									<AddressSelector
										form={form}
										addressMode={addressMode}
										addresses={addresses}
										addressesLoading={addressesLoading}
										isCreatingAddress={isCreatingAddress}
										isDeletePending={deleteAddressMutation.isPending}
										onCreateAddress={handleCreateAddress}
										onDeleteAddress={handleDeleteAddress}
									/>
								)}

								{/* Pickup Date Selection for Specials Orders */}
								{!isPostalBrownies && hasSpecials && specialsSettings && (
									<PickupScheduler
										form={form}
										hasSpecials={true}
										specialsSettings={specialsSettings}
										maxLeadTime={maxLeadTime}
										pickupDate={pickupDate}
										pickupTime={pickupTime}
									/>
								)}

								{/* Pickup Date and Time - Only for non-postal, non-specials orders */}
								{!isPostalBrownies && !hasSpecials && (
									<PickupScheduler
										form={form}
										hasSpecials={false}
										maxLeadTime={maxLeadTime}
										pickupDate={pickupDate}
										pickupTime={pickupTime}
									/>
								)}

								{/* Mobile Continue to Review Button */}
								<div className="lg:hidden mt-6 pt-4 border-t w-full space-y-3">
									<Button
										type="button"
										className="w-full"
										disabled={
											!isStep2Valid ||
											(isPostalBrownies && addressMode === "new") ||
											(isPostalBrownies && !selectedAddressId)
										}
										onClick={() => {
											document.documentElement.scrollIntoView({
												behavior: "smooth",
												block: "start",
											});
											setStep(3);
										}}
									>
										Continue to Review Order
										<ChevronRight className="w-4 h-4 ml-1.5" />
									</Button>

									<div className="text-center">
										{isPostalBrownies && addressMode === "new" ? (
											<p className="text-xs text-muted-foreground">
												Please create and save your address before proceeding
											</p>
										) : isPostalBrownies && !selectedAddressId ? (
											<p className="text-xs text-muted-foreground">
												Please select a delivery address to continue
											</p>
										) : null}
									</div>
								</div>
							</div>

							{/* Desktop Pay Button (always visible under step 2 on desktop) */}
							<div className="hidden lg:block mt-8 pt-6 border-t">
								<form.Subscribe
									selector={(state) => state.isSubmitting}
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(formIsSubmitting) => (
										<Button
											type="submit"
											className="w-full text-base cursor-pointer"
											disabled={
												!isOrderingAllowed ||
												formIsSubmitting ||
												isProcessing ||
												!isStep1Valid ||
												!isStep2Valid ||
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
													: !isStep1Valid
														? "Complete Contact Info"
														: isPostalBrownies && addressMode === "new"
															? "Create Address First"
															: isPostalBrownies && !selectedAddressId
																? "Select Address to Continue"
																: "Place Order & Pay"}
										</Button>
									)}
								/>
								<div className="text-center mt-2">
									{!isOrderingAllowed && (
										<p className="text-xs text-muted-foreground">
											{!settings?.isActive
												? "Cake order system is currently disabled"
												: "Orders are only accepted on allowed days"}
										</p>
									)}
								</div>
							</div>
						</form>
					</CardContent>
				</Card>

				<div
					className={cn(
						"order-1 lg:order-2",
						"lg:col-span-5 xl:col-span-4",
						step !== 3 && "hidden lg:block", // Hide summary column entirely on mobile step 1 and 2
					)}
				>
					{step === 3 && (
						<div className="lg:hidden mb-4 px-1">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setStep(2)}
								className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
							>
								<ChevronLeft className="w-4 h-4 mr-1" /> Back to{" "}
								{isPostalBrownies ? "Delivery" : "Pickup"}
							</Button>
						</div>
					)}
					<OrderSummary
						items={items.map((item) => ({
							...item,
							price: Number(item.price),
						}))}
						desserts={desserts.map((d) => ({
							id: d.id,
							leadTimeDays: d.leadTimeDays,
						}))}
						total={Number(total)}
						deliveryCost={deliveryCost}
						isDiscountApplied={isDiscountApplied}
						isPostalBrownies={isPostalBrownies}
						hasSpecials={hasSpecials}
						maxLeadTime={maxLeadTime}
						specialsSettings={specialsSettings}
						pickupDate={pickupDate}
						pickupTime={pickupTime}
						timeSlots={TIME_SLOTS}
						selectedAddress={
							isPostalBrownies && selectedAddressId
								? addresses.find((addr) => addr.id === selectedAddressId) ||
									null
								: null
						}
						currentSlot={isPostalBrownies ? getCurrentActiveSlot() : null}
					/>
				</div>
			</FadeIn>

			{/* Phone Edit Dialog */}
			<PhoneEditDialog
				isOpen={isPhoneEditDialogOpen}
				onClose={() => setIsPhoneEditDialogOpen(false)}
				currentPhone={form.getFieldValue("phone")}
				onSave={handlePhoneEditSave}
			/>

			{/* Sticky Mobile Pay Bar - Only visible on step 3 where we actually submit */}
			<div
				className={cn(
					"fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg p-3 z-40 lg:hidden",
					step === 3 ? "translate-y-0" : "translate-y-full",
					"transition-transform duration-300 ease-in-out",
				)}
			>
				<div className="container mx-auto flex items-center justify-between gap-3">
					<div className="flex flex-col min-w-0">
						<span className="text-xs text-muted-foreground">Total to Pay</span>
						<span className="text-lg font-bold text-primary">
							₹{finalTotal.toLocaleString("en-IN")}
						</span>
					</div>
					<Button
						type="button"
						onClick={() => form.handleSubmit()}
						disabled={
							!isOrderingAllowed ||
							isProcessing ||
							!isStep1Valid ||
							!isStep2Valid ||
							(isPostalBrownies && addressMode === "new") ||
							(isPostalBrownies && !selectedAddressId)
						}
						size="lg"
						className="flex-1 max-w-50 cursor-pointer shadow-md active:scale-95 transition-transform"
						variant={!isOrderingAllowed ? "secondary" : "default"}
					>
						{!isOrderingAllowed
							? "Unavailable"
							: isProcessing
								? "Processing..."
								: "Place Order & Pay"}
					</Button>
				</div>
			</div>
		</div>
	);
}
