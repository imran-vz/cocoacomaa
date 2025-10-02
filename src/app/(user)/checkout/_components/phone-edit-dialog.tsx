"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { validatePhoneNumber } from "@/lib/phone-validation";

const phoneEditSchema = z
	.object({
		phone: z
			.string()
			.min(10, { message: "Phone number must be at least 10 digits." })
			.refine((phone) => validatePhoneNumber(phone, "IN").isValid, {
				message: "Please enter a valid phone number.",
			}),
		confirmPhone: z
			.string()
			.min(10, { message: "Please confirm your phone number." }),
	})
	.refine((data) => data.phone === data.confirmPhone, {
		message: "Phone numbers don't match",
		path: ["confirmPhone"],
	});

type PhoneEditFormValues = z.infer<typeof phoneEditSchema>;

interface PhoneEditDialogProps {
	isOpen: boolean;
	onClose: () => void;
	currentPhone: string;
	onSave: (phone: string) => Promise<void>;
}

export function PhoneEditDialog({
	isOpen,
	onClose,
	currentPhone,
	onSave,
}: PhoneEditDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<PhoneEditFormValues>({
		resolver: zodResolver(phoneEditSchema),
		defaultValues: {
			phone: currentPhone || "",
			confirmPhone: "",
		},
	});

	const handleSubmit = async (data: PhoneEditFormValues) => {
		try {
			setIsSubmitting(true);
			await onSave(data.phone);
			toast.success("Phone number updated successfully");
			onClose();
		} catch (error) {
			console.error("Error updating phone number:", error);
			toast.error("Failed to update phone number. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open && !isSubmitting) {
			form.reset();
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Phone Number</DialogTitle>
					<DialogDescription>
						Update your phone number for this order. You'll need to confirm it
						to continue.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number</FormLabel>
									<FormControl>
										<Input
											type="tel"
											placeholder="Enter your phone number"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPhone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Phone Number</FormLabel>
									<FormControl>
										<Input
											type="tel"
											placeholder="Re-enter your phone number"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormDescription>
										Please re-enter your phone number to confirm
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Updating..." : "Update"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
