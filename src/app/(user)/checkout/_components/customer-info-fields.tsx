import { Edit2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type CustomerInfoFieldsProps = {
	// biome-ignore lint/suspicious/noExplicitAny: we need to use any here because the form is dynamically generated
	form: UseFormReturn<any>;
	isPhoneFieldEnabled: boolean;
	isProcessing: boolean;
	onPhoneEditClick: () => void;
};

export function CustomerInfoFields({
	form,
	isPhoneFieldEnabled,
	isProcessing,
	onPhoneEditClick,
}: CustomerInfoFieldsProps) {
	return (
		<>
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-sm sm:text-base">Full Name</FormLabel>
						<FormControl>
							<Input
								placeholder="Enter your full name"
								{...field}
								className="text-sm sm:text-base"
								disabled
								readOnly
								tabIndex={-1}
							/>
						</FormControl>
						<FormMessage className="text-xs sm:text-sm" />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="email"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-sm sm:text-base">
							Email Address
						</FormLabel>
						<FormControl>
							<Input
								type="email"
								placeholder="Enter your email address"
								{...field}
								className="text-sm sm:text-base"
								readOnly
								disabled
								tabIndex={-1}
							/>
						</FormControl>
						<FormMessage className="text-xs sm:text-sm" />
					</FormItem>
				)}
			/>

			{/* Phone fields - Show differently based on whether user has phone */}
			{isPhoneFieldEnabled ? (
				// First-time user or user with no phone - show both fields
				<>
					<FormField
						control={form.control}
						name="phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm sm:text-base">
									Phone Number
								</FormLabel>
								<FormControl>
									<Input
										type="tel"
										placeholder="Enter your phone number"
										{...field}
										className="text-sm sm:text-base"
										readOnly={isProcessing}
										disabled={isProcessing}
									/>
								</FormControl>
								<FormMessage className="text-xs sm:text-sm" />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPhone"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm sm:text-base">
									Confirm Phone Number
								</FormLabel>
								<FormControl>
									<Input
										type="tel"
										placeholder="Re-enter your phone number"
										{...field}
										className="text-sm sm:text-base"
										readOnly={isProcessing}
										disabled={isProcessing}
										onPaste={(e) => {
											e.preventDefault();
											return false;
										}}
									/>
								</FormControl>
								<FormDescription className="text-xs sm:text-sm">
									Please re-enter your phone number to confirm
								</FormDescription>
								<FormMessage className="text-xs sm:text-sm" />
							</FormItem>
						)}
					/>
				</>
			) : (
				// Repeat user with phone - show phone with edit button
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm sm:text-base">
								Phone Number
							</FormLabel>
							<div className="flex gap-2">
								<FormControl>
									<Input
										type="tel"
										{...field}
										className="text-sm sm:text-base"
										readOnly
										disabled
										tabIndex={-1}
									/>
								</FormControl>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={onPhoneEditClick}
									disabled={isProcessing}
									title="Edit phone number"
								>
									<Edit2 className="h-4 w-4" />
								</Button>
							</div>
							<FormMessage className="text-xs sm:text-sm" />
						</FormItem>
					)}
				/>
			)}
		</>
	);
}
