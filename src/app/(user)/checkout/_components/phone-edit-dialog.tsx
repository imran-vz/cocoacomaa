"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
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
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
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

	const form = useForm({
		defaultValues: {
			phone: currentPhone || "",
			confirmPhone: "",
		},
		validators: {
			onSubmit: phoneEditSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				setIsSubmitting(true);
				await onSave(value.phone);
				toast.success("Phone number updated successfully");
				onClose();
			} catch (error) {
				console.error("Error updating phone number:", error);
				toast.error("Failed to update phone number. Please try again.");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

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

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<FieldGroup>
						<form.Field
							name="phone"
							// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="tel"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Enter your phone number"
											disabled={isSubmitting}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						<form.Field
							name="confirmPhone"
							// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Confirm Phone Number
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="tel"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Re-enter your phone number"
											disabled={isSubmitting}
											onPaste={(e) => {
												e.preventDefault();
												return false;
											}}
										/>
										<FieldDescription>
											Please re-enter your phone number to confirm
										</FieldDescription>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
					</FieldGroup>

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
			</DialogContent>
		</Dialog>
	);
}
