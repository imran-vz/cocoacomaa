import z from "zod";

export const registerSchema = z.object({
	name: z.string().min(1, { message: "Name is required." }),
	email: z.string().email({ message: "Invalid email address." }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters." }),
	phone: z
		.string()
		.min(10, { message: "Phone number must be at least 10 digits." })
		.regex(/^[0-9]+$/, { message: "Phone number must contain only numbers." })
		.max(10, { message: "Phone number must be at most 10 digits." }),
});

export const loginSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address." }),
	password: z.string().min(1, { message: "Password is required." }),
});

export const checkoutFormSchemaDB = z
	.object({
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
		pickupDate: z
			.string()
			.refine(
				(val) => {
					try {
						const date = new Date(val);
						return !Number.isNaN(date.getTime());
					} catch (_error) {
						return false;
					}
				},
				{ message: "Please select a valid pickup date." },
			)
			.refine(
				(val) => {
					try {
						const date = new Date(val);
						const dayOfWeek = date.getDay();
						// Reject Monday (1) and Tuesday (2) for cake orders
						return dayOfWeek !== 1 && dayOfWeek !== 2;
					} catch (_error) {
						return true; // Let the first refine handle invalid dates
					}
				},
				{
					message:
						"Pickup is not available on Mondays and Tuesdays. Please select Wednesday through Sunday.",
				},
			)
			.optional(),
		pickupTime: z
			.string()
			.min(1, {
				message: "Please select a pickup time.",
			})
			.optional(),
		notes: z
			.string()
			.max(250, {
				message: "Notes must be less than 250 characters.",
			})
			.optional(),
		items: z.array(
			z.object({
				id: z.number(),
				name: z.string(),
				price: z.number(),
				quantity: z.number(),
				category: z.string().optional(),
			}),
		),
		orderType: z.enum(["cake-orders", "postal-brownies"]),
		total: z.number(),
		deliveryCost: z.number().optional(), // Delivery cost for postal brownies
		// Address selection for postal brownies
		selectedAddressId: z.number().optional(),
		// Gift order fields
		isGift: z.boolean().default(false),
		giftMessage: z
			.string()
			.max(500, {
				message: "Gift message must be less than 500 characters.",
			})
			.optional(),
		recipientName: z.string().optional(),
		recipientPhone: z.string().optional(),
		recipientAddressLine1: z.string().optional(),
		recipientAddressLine2: z.string().optional(),
		recipientCity: z.string().optional(),
		recipientState: z.string().optional(),
		recipientZip: z.string().optional(),
		selectedRecipientContactId: z.number().optional(),
	})
	.refine(
		(data) => {
			// If orderType is postal-brownies, pickup fields are not required
			if (data.orderType === "postal-brownies") {
				return true;
			}

			// Check if order contains special desserts
			const hasSpecials = data.items.some(
				(item) => item.category === "special",
			);

			// If order contains specials, pickup fields are not required
			if (hasSpecials) {
				return true;
			}

			// For regular cake orders, pickup fields are required
			return data.pickupDate && data.pickupTime;
		},
		{
			message: "Pickup date and time are required for regular cake orders",
			path: ["pickupDate"],
		},
	)
	.refine(
		(data) => {
			// If orderType is postal-brownies and NOT a gift order, address is required
			if (data.orderType === "postal-brownies" && !data.isGift) {
				// Either selectedAddressId should be provided
				if (data.selectedAddressId) {
					return true; // If existing address is selected, no need to validate individual fields
				}

				return false;
			}
			return true;
		},
		{
			message: "Please select an address",
			path: ["selectedAddressId"],
		},
	)
	.refine(
		(data) => {
			// If isGift is true, recipient name is required
			if (data.isGift) {
				return data.recipientName && data.recipientName.trim().length >= 2;
			}
			return true;
		},
		{
			message: "Recipient name is required for gift orders",
			path: ["recipientName"],
		},
	)
	.refine(
		(data) => {
			// If isGift is true, recipient phone is required
			if (data.isGift) {
				return (
					data.recipientPhone &&
					data.recipientPhone.length >= 10 &&
					/^[0-9+\-\s()]+$/.test(data.recipientPhone)
				);
			}
			return true;
		},
		{
			message: "Valid recipient phone is required for gift orders",
			path: ["recipientPhone"],
		},
	)
	.refine(
		(data) => {
			// If isGift and postal-brownies, recipient address is required
			if (data.isGift && data.orderType === "postal-brownies") {
				// Either contact selected or address fields provided
				if (data.selectedRecipientContactId) {
					return true;
				}
				return (
					data.recipientAddressLine1 &&
					data.recipientCity &&
					data.recipientState &&
					data.recipientZip
				);
			}
			return true;
		},
		{
			message: "Recipient address is required for gift postal orders",
			path: ["recipientAddressLine1"],
		},
	);

export const forgotPasswordSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address." }),
});

export const resetPasswordSchema = z
	.object({
		token: z
			.string()
			.min(6, { message: "Please enter a valid 6-digit OTP." })
			.max(6),
		email: z.string().email({ message: "Please enter a valid email address." }),
		password: z
			.string()
			.min(6, { message: "Password must be at least 6 characters." }),
		confirmPassword: z
			.string()
			.min(6, { message: "Please confirm your password." }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match.",
		path: ["confirmPassword"],
	});
