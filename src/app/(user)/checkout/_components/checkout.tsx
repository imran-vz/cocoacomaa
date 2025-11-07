"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { confirm } from "@/components/confirm-dialog";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
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
import OrderRestrictionBanner from "@/components/ui/order-restriction-banner";
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
import type { CustomerContact } from "@/lib/db/schema";
import {
	calculateDeliveryCost,
	isBengaluruAddress,
} from "@/lib/delivery-pricing";
import { formatYearMonth } from "@/lib/format-timestamp";
import { validatePhoneNumber } from "@/lib/phone-validation";
import type {
	RazorpayOptions,
	RazorpayOrderData,
	RazorpayResponse,
} from "@/types/razorpay";
import { CustomerInfoFields } from "./customer-info-fields";
import { DeliveryAddressSection } from "./delivery-address-section";
import { EditContactDialog } from "./edit-contact-dialog";
import { GiftToggleSection } from "./gift-toggle-section";
import { OrderSummaryCard } from "./order-summary-card";
import { PhoneEditDialog } from "./phone-edit-dialog";
import { PickupScheduleSection } from "./pickup-schedule-section";
import { RecipientInfoSection } from "./recipient-info-section";

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
						required_error: "Please select a pickup date.",
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
		selectedAddressId: z.number().optional(),
		// New address fields (only used when addressMode is "new")
		addressLine1: z.string().optional(),
		addressLine2: z.string().optional(),
		city: z.string().optional(),
		state: z.string().optional(),
		zip: z.string().optional(),
		// Gift order fields
		isGift: z.boolean(),
		giftMessage: z
			.string()
			.max(500, {
				message: "Gift message must be less than 500 characters.",
			})
			.optional(),
		recipientName: z.string().optional(),
		recipientPhone: z.string().optional(),
		confirmRecipientPhone: z.string().optional(),
		selectedRecipientContactId: z.number().optional(),
		recipientAddressLine1: z.string().optional(),
		recipientAddressLine2: z.string().optional(),
		recipientCity: z.string().optional(),
		recipientState: z.string().optional(),
		recipientZip: z.string().optional(),
	});

	// Add refinement to check that phone numbers match (only when confirmPhone is required)
	// Always refine for consistent typing
	return baseSchema
		.refine(
			(data) => {
				if (hasExistingPhone) return true;
				return data.phone === data.confirmPhone;
			},
			{
				message: "Phone numbers don't match",
				path: ["confirmPhone"],
			},
		)
		.refine(
			(data) => {
				if (!data.isGift) return true;
				return data.recipientName && data.recipientName.trim().length >= 2;
			},
			{
				message: "Recipient name is required for gift orders",
				path: ["recipientName"],
			},
		)
		.refine(
			(data) => {
				if (!data.isGift) return true;
				return data.recipientPhone && data.recipientPhone.length >= 10;
			},
			{
				message: "Recipient phone is required for gift orders",
				path: ["recipientPhone"],
			},
		)
		.refine(
			(data) => {
				if (!data.isGift) return true;
				return data.recipientPhone === data.confirmRecipientPhone;
			},
			{
				message: "Recipient phone numbers don't match",
				path: ["confirmRecipientPhone"],
			},
		)
		.refine(
			(data) => {
				if (!data.isGift || !isPostalBrownies) return true;
				// For postal brownies gifts, need recipient address
				if (data.selectedRecipientContactId) return true;
				return (
					data.recipientAddressLine1 &&
					data.recipientCity &&
					data.recipientState &&
					data.recipientZip
				);
			},
			{
				message: "Recipient address is required for gift postal orders",
				path: ["recipientAddressLine1"],
			},
		)
		.refine(
			(data) => {
				// For non-gift postal brownies, selectedAddressId is required
				if (!isPostalBrownies || data.isGift) return true;
				return data.selectedAddressId && data.selectedAddressId > 0;
			},
			{
				message: "Please select a delivery address",
				path: ["selectedAddressId"],
			},
		);
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
	const [selectedRecipientContact, setSelectedRecipientContact] = useState<
		| (CustomerContact & {
				address: {
					id: number;
					addressLine1: string;
					addressLine2: string | null;
					city: string;
					state: string;
					zip: string;
				};
		  })
		| null
	>(null);
	const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false);
	const [contactToEdit, setContactToEdit] = useState<
		| (CustomerContact & {
				address: {
					id: number;
					addressLine1: string;
					addressLine2: string | null;
					city: string;
					state: string;
					zip: string;
				};
		  })
		| null
	>(null);
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

	const form = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutFormSchema),
		defaultValues: {
			name: name ?? "",
			email: email ?? "",
			phone: phone ?? "",
			confirmPhone: phone ?? "",
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
			isGift: false,
			giftMessage: "",
			recipientName: "",
			recipientPhone: "",
			confirmRecipientPhone: "",
			selectedRecipientContactId: undefined,
			recipientAddressLine1: "",
			recipientAddressLine2: "",
			recipientCity: "",
			recipientState: "",
			recipientZip: "",
		},
	});

	const addressMode = useWatch({
		control: form.control,
		name: "addressMode",
	});

	const isGift = useWatch({
		control: form.control,
		name: "isGift",
	});

	// Watch new address form fields for dynamic pricing
	const newAddressCity = useWatch({
		control: form.control,
		name: "city",
	});

	const newAddressZip = useWatch({
		control: form.control,
		name: "zip",
	});

	const selectedAddressId = useWatch({
		control: form.control,
		name: "selectedAddressId",
	});

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

	type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

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
			form.setValue("confirmPhone", phone);
		}
	}, [phone, form]);

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
			const newAddress = await createAddressMutation.mutateAsync({
				...validation.data,
				addressLine2: validation.data.addressLine2 || null,
			});

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
				form.setValue("selectedAddressId", undefined);
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
			form.setValue("phone", newPhone);
			form.setValue("confirmPhone", newPhone);
			setOriginalPhone(newPhone);
			setIsPhoneFieldEnabled(false);
		} catch (error) {
			console.error("Error saving phone number:", error);
			throw error;
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
			if (isPhoneFieldEnabled && data.phone !== originalPhone) {
				setProcessingStep("Updating contact information...");
				try {
					await updateUserPhone(data.phone);
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
							? data.selectedAddressId
							: undefined,
						// Gift order fields
						isGift: data.isGift,
						giftMessage: data.giftMessage,
						recipientName: data.recipientName,
						recipientPhone: data.recipientPhone,
						selectedRecipientContactId: data.selectedRecipientContactId,
						recipientAddressLine1: data.recipientAddressLine1,
						recipientAddressLine2: data.recipientAddressLine2,
						recipientCity: data.recipientCity,
						recipientState: data.recipientState,
						recipientZip: data.recipientZip,
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
			await handlePayment(data, orderId, orderData);
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
				<div className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-background rounded-lg p-6 sm:p-8 max-w-sm mx-4 text-center shadow-xl">
						<div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4" />
						<h3 className="text-lg sm:text-xl font-semibold mb-2 text-primary">
							Processing Order
						</h3>
						<p className="text-sm sm:text-base text-primary">
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

								<CustomerInfoFields
									form={form}
									isPhoneFieldEnabled={isPhoneFieldEnabled}
									isProcessing={isProcessing}
									onPhoneEditClick={() => setIsPhoneEditDialogOpen(true)}
								/>

								{/* Gift Toggle Section - Only for delivery orders (postal brownies) */}
								{isPostalBrownies && <GiftToggleSection form={form} />}

								{/* Recipient Section - shown when isGift is true */}
								{isGift && (
									<RecipientInfoSection
										form={form}
										isPostalBrownies={isPostalBrownies}
										selectedRecipientContact={selectedRecipientContact}
										onContactSelect={(contact) =>
											setSelectedRecipientContact(contact)
										}
										onEditContact={(contact) => {
											setContactToEdit(contact);
											setIsEditContactDialogOpen(true);
										}}
									/>
								)}

								{!hasSpecials && !isGift && (
									<FormField
										control={form.control}
										name="notes"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm sm:text-base">
													{isPostalBrownies
														? "Message (Optional)"
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
								)}

								{/* Address Fields - Only for postal brownies and not gift orders */}
								{isPostalBrownies && !isGift && (
									<DeliveryAddressSection
										form={form}
										addresses={addresses}
										addressesLoading={addressesLoading}
										isCreatingAddress={isCreatingAddress}
										deleteAddressIsPending={deleteAddressMutation.isPending}
										onCreateAddress={handleCreateAddress}
										onDeleteAddress={handleDeleteAddress}
									/>
								)}

								{/* Pickup Date and Time - Only for non-postal orders */}
								{!isPostalBrownies && (
									<PickupScheduleSection
										form={form}
										maxLeadTime={maxLeadTime}
										isDateDisabled={isDateDisabled}
										timeSlots={timeSlots}
										hasSpecials={hasSpecials}
										specialsSettings={specialsSettings}
									/>
								)}

								<Button
									type="submit"
									className="w-full text-sm sm:text-base cursor-pointer"
									disabled={
										!isOrderingAllowed ||
										form.formState.isSubmitting ||
										isProcessing ||
										(isPostalBrownies && !isGift && addressMode === "new") ||
										(isPostalBrownies && !isGift && !selectedAddressId)
									}
									size="lg"
									variant={!isOrderingAllowed ? "secondary" : "default"}
								>
									{!isOrderingAllowed
										? "Orders Unavailable"
										: form.formState.isSubmitting || isProcessing
											? "Processing..."
											: isPostalBrownies && !isGift && addressMode === "new"
												? "Create Address First"
												: isPostalBrownies && !isGift && !selectedAddressId
													? "Select Address to Continue"
													: "Place Order & Pay"}
								</Button>

								{/* Helper text for postal brownies and order restrictions */}
								{(isPostalBrownies || !isOrderingAllowed) && (
									<div className="text-center mt-2">
										{!isOrderingAllowed ? (
											<p className="text-xs text-muted-foreground">
												{!settings?.isActive
													? "Cake order system is currently disabled"
													: "Orders are only accepted on allowed days"}
											</p>
										) : isPostalBrownies && !isGift && addressMode === "new" ? (
											<p className="text-xs text-muted-foreground">
												Please create and save your address before placing the
												order
											</p>
										) : isPostalBrownies && !isGift && !selectedAddressId ? (
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
				<OrderSummaryCard
					form={form}
					items={items}
					total={total}
					deliveryCost={deliveryCost}
					isDiscountApplied={isDiscountApplied}
					isPostalBrownies={isPostalBrownies}
					hasSpecials={hasSpecials}
					maxLeadTime={maxLeadTime}
					desserts={desserts}
					addresses={addresses}
					timeSlots={timeSlots}
					specialsSettings={specialsSettings}
					getCurrentActiveSlot={getCurrentActiveSlot}
				/>
			</FadeIn>

			{/* Phone Edit Dialog */}
			<PhoneEditDialog
				isOpen={isPhoneEditDialogOpen}
				onClose={() => setIsPhoneEditDialogOpen(false)}
				currentPhone={form.getValues("phone")}
				onSave={handlePhoneEditSave}
			/>

			{/* Edit Contact Dialog */}
			<EditContactDialog
				contact={contactToEdit}
				open={isEditContactDialogOpen}
				onOpenChange={setIsEditContactDialogOpen}
				onSuccess={(updatedContact) => {
					// Update form with new contact details
					form.setValue("selectedRecipientContactId", updatedContact.id);
					form.setValue("recipientName", updatedContact.name);
					form.setValue("recipientPhone", updatedContact.phone);
					form.setValue("confirmRecipientPhone", updatedContact.phone);
					form.setValue(
						"recipientAddressLine1",
						updatedContact.address.addressLine1,
					);
					form.setValue(
						"recipientAddressLine2",
						updatedContact.address.addressLine2 || "",
					);
					form.setValue("recipientCity", updatedContact.address.city);
					form.setValue("recipientState", updatedContact.address.state);
					form.setValue("recipientZip", updatedContact.address.zip);
					setSelectedRecipientContact(updatedContact);
					setContactToEdit(null);
				}}
			/>
		</div>
	);
}
