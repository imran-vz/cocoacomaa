"use client";

import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ContactInfoFormProps {
	/** User's display name */
	name: string;
	/** User's email address */
	email: string;
	/** Whether the phone input fields are shown (first-time user) */
	isPhoneFieldEnabled: boolean;
	/** Whether the checkout is being processed */
	isProcessing: boolean;
	/** The TanStack form instance */
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form field API
	form: any;
	/** Whether "specials" items are in the cart (hides cake message field) */
	hasSpecials: boolean;
	/** Whether cart contains postal brownies (changes notes label) */
	isPostalBrownies: boolean;
	/** Opens the phone edit dialog (returning users) */
	onOpenPhoneEdit: () => void;
}

// biome-ignore lint/suspicious/noExplicitAny: TanStack Form field API
type FieldApi = any;

/**
 * Contact info section of the checkout form.
 * Shows a compact contact card for name/email, and either full phone inputs (new user)
 * or a read-only phone display with edit button (returning user).
 * Also includes the notes/message field.
 */
export function ContactInfoForm({
	name,
	email,
	isPhoneFieldEnabled,
	isProcessing,
	form,
	hasSpecials,
	isPostalBrownies,
	onOpenPhoneEdit,
}: ContactInfoFormProps) {
	return (
		<>
			{/* Compact contact display — replaces disabled inputs */}
			<div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
				<div className="flex items-center justify-between mb-2">
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Contact
					</span>
				</div>
				<div className="space-y-1">
					<p className="text-sm font-medium">{name}</p>
					<p className="text-sm text-muted-foreground">{email}</p>
				</div>
			</div>

			{/* Phone — compact display for returning users, full input for new */}
			{isPhoneFieldEnabled ? (
				// First-time user or user with no phone - show both fields
				<>
					<form.Field
						name="phone"
						// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
						children={(field: FieldApi) => {
							const hasErrors =
								field.state.meta.errors && field.state.meta.errors.length > 0;
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
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											field.handleChange(e.target.value)
										}
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
						children={(field: FieldApi) => {
							const hasErrors =
								field.state.meta.errors && field.state.meta.errors.length > 0;
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
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											field.handleChange(e.target.value)
										}
										placeholder="Re-enter your phone number"
										className="text-sm sm:text-base"
										readOnly={isProcessing}
										disabled={isProcessing}
										onPaste={(e: React.ClipboardEvent) => {
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
				// Returning user — compact phone display with edit
				<div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
					<div className="flex items-center justify-between">
						<div>
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
								Phone
							</span>
							<p className="text-sm font-medium mt-0.5">
								{form.getFieldValue("phone")}
							</p>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onOpenPhoneEdit}
							disabled={isProcessing}
							className="text-xs h-7"
						>
							<Edit2 className="h-3 w-3 mr-1" />
							Edit
						</Button>
					</div>
				</div>
			)}

			{/* Notes / Message on Cake field */}
			{!hasSpecials && (
				<form.Field
					name="notes"
					// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
					children={(field: FieldApi) => {
						const hasErrors =
							field.state.meta.errors && field.state.meta.errors.length > 0;
						return (
							<Field data-invalid={hasErrors}>
								<FieldLabel
									htmlFor={field.name}
									className="text-sm sm:text-base"
								>
									{isPostalBrownies ? "Message (Optional)" : "Message on Cake"}
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value ?? ""}
									onBlur={field.handleBlur}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										field.handleChange(e.target.value)
									}
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
		</>
	);
}
