import type { UseFormReturn } from "react-hook-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CustomerContact } from "@/lib/db/schema";
import { RecipientContactSelector } from "./recipient-contact-selector";

type RecipientInfoSectionProps = {
	// biome-ignore lint/suspicious/noExplicitAny: we need to use any here because the form is dynamically generated
	form: UseFormReturn<any>;
	isPostalBrownies: boolean;
	selectedRecipientContact:
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
		| null;
	onContactSelect: (
		contact:
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
			| null,
	) => void;
	onEditContact: (
		contact: CustomerContact & {
			address: {
				id: number;
				addressLine1: string;
				addressLine2: string | null;
				city: string;
				state: string;
				zip: string;
			};
		},
	) => void;
};

export function RecipientInfoSection({
	form,
	isPostalBrownies,
	selectedRecipientContact,
	onContactSelect,
	onEditContact,
}: RecipientInfoSectionProps) {
	return (
		<div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
			<div>
				<h3 className="text-sm sm:text-base font-semibold mb-2">
					Recipient Information
				</h3>
				<p className="text-xs sm:text-sm text-muted-foreground">
					Enter the recipient's details for this gift order
				</p>
			</div>

			{/* Saved Contacts Selector - only for postal brownies */}
			{isPostalBrownies && (
				<RecipientContactSelector
					selectedContactId={form.watch("selectedRecipientContactId")}
					onContactSelect={(contact) => {
						if (contact) {
							form.setValue("selectedRecipientContactId", contact.id);
							form.setValue("recipientName", contact.name);
							form.setValue("recipientPhone", contact.phone);
							form.setValue("confirmRecipientPhone", contact.phone);
							form.setValue(
								"recipientAddressLine1",
								contact.address.addressLine1,
							);
							form.setValue(
								"recipientAddressLine2",
								contact.address.addressLine2 || "",
							);
							form.setValue("recipientCity", contact.address.city);
							form.setValue("recipientState", contact.address.state);
							form.setValue("recipientZip", contact.address.zip);
							onContactSelect(contact);
						} else {
							form.setValue("selectedRecipientContactId", undefined);
							form.setValue("recipientName", "");
							form.setValue("recipientPhone", "");
							form.setValue("confirmRecipientPhone", "");
							form.setValue("recipientAddressLine1", "");
							form.setValue("recipientAddressLine2", "");
							form.setValue("recipientCity", "");
							form.setValue("recipientState", "");
							form.setValue("recipientZip", "");
							onContactSelect(null);
						}
					}}
					onEditContact={onEditContact}
				/>
			)}

			<FormField
				control={form.control}
				name="recipientName"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-sm sm:text-base">
							Recipient Name
						</FormLabel>
						<FormControl>
							<Input
								placeholder="Enter recipient's name"
								{...field}
								className="text-sm sm:text-base"
							/>
						</FormControl>
						<FormMessage className="text-xs sm:text-sm" />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="recipientPhone"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-sm sm:text-base">
							Recipient Phone Number
						</FormLabel>
						<FormControl>
							<Input
								type="tel"
								placeholder="Enter recipient's phone number"
								{...field}
								className="text-sm sm:text-base"
							/>
						</FormControl>
						<FormMessage className="text-xs sm:text-sm" />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="confirmRecipientPhone"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-sm sm:text-base">
							Confirm Recipient Phone
						</FormLabel>
						<FormControl>
							<Input
								type="tel"
								placeholder="Re-enter recipient's phone number"
								{...field}
								className="text-sm sm:text-base"
								onPaste={(e) => {
									e.preventDefault();
									return false;
								}}
							/>
						</FormControl>
						<FormDescription className="text-xs sm:text-sm">
							Please re-enter phone to confirm
						</FormDescription>
						<FormMessage className="text-xs sm:text-sm" />
					</FormItem>
				)}
			/>

			{/* Recipient Address - only for postal brownies */}
			{isPostalBrownies && !selectedRecipientContact && (
				<div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
					<div>
						<h4 className="text-sm font-semibold mb-2">
							Recipient Delivery Address
						</h4>
					</div>

					<FormField
						control={form.control}
						name="recipientAddressLine1"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm sm:text-base">
									Address Line 1
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Street address"
										{...field}
										className="text-sm sm:text-base"
									/>
								</FormControl>
								<FormMessage className="text-xs sm:text-sm" />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="recipientAddressLine2"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm sm:text-base">
									Address Line 2 (Optional)
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Apartment, suite, etc."
										{...field}
										className="text-sm sm:text-base"
									/>
								</FormControl>
								<FormMessage className="text-xs sm:text-sm" />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						<FormField
							control={form.control}
							name="recipientCity"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm sm:text-base">City</FormLabel>
									<FormControl>
										<Input
											placeholder="City"
											{...field}
											className="text-sm sm:text-base"
										/>
									</FormControl>
									<FormMessage className="text-xs sm:text-sm" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="recipientState"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm sm:text-base">State</FormLabel>
									<FormControl>
										<Input
											placeholder="State"
											{...field}
											className="text-sm sm:text-base"
										/>
									</FormControl>
									<FormMessage className="text-xs sm:text-sm" />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="recipientZip"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm sm:text-base">ZIP Code</FormLabel>
								<FormControl>
									<Input
										placeholder="ZIP Code"
										{...field}
										className="text-sm sm:text-base"
									/>
								</FormControl>
								<FormMessage className="text-xs sm:text-sm" />
							</FormItem>
						)}
					/>
				</div>
			)}

			{/* Gift Message */}
			<FormField
				control={form.control}
				name="giftMessage"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-sm sm:text-base">
							Gift Message (Optional)
						</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Add a personal message to your gift..."
								{...field}
								className="text-sm sm:text-base min-h-[100px]"
								maxLength={500}
							/>
						</FormControl>
						<FormDescription className="text-xs sm:text-sm text-muted-foreground">
							Maximum 500 characters
						</FormDescription>
						<FormMessage className="text-xs sm:text-sm" />
					</FormItem>
				)}
			/>
		</div>
	);
}
