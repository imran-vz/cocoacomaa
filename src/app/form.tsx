"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const emailFormSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

export function EmailForm() {
	const form = useForm<EmailFormValues>({
		resolver: zodResolver(emailFormSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: EmailFormValues) => {
		try {
			// Here you would typically send the email to your backend
			console.log("Subscription email:", data.email);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success("Successfully subscribed to updates!");
			form.reset();
		} catch (error) {
			console.error("Error subscribing:", error);
			toast.error("Failed to subscribe. Please try again.");
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="pt-4 grid grid-cols-1 gap-4 md:grid-cols-4 grid-rows-2 md:grid-rows-1"
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="md:col-span-3">
							<FormControl>
								<Input
									type="email"
									autoComplete="email"
									placeholder="Email"
									className="bg-transparent border-gray-600 text-white placeholder:text-gray-400 h-12"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="w-full bg-white text-black hover:bg-gray-100 h-12"
					disabled={form.formState.isSubmitting}
				>
					{form.formState.isSubmitting ? "SIGNING UP..." : "SIGN UP"}
				</Button>
			</form>
		</Form>
	);
}
