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
