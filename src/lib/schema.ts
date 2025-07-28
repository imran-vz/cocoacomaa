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
			// If orderType is postal-brownies, address fields are required
			if (data.orderType === "postal-brownies") {
				// Either selectedAddressId should be provided or manual address fields
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
