import { Package, Trash2 } from "lucide-react";
import { useId } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Address = {
	id: number;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	zip: string;
};

type DeliveryAddressSectionProps = {
	// biome-ignore lint/suspicious/noExplicitAny: we need to use any here because the form is dynamically generated
	form: UseFormReturn<any>;
	addresses: Address[];
	addressesLoading: boolean;
	isCreatingAddress: boolean;
	deleteAddressIsPending: boolean;
	onCreateAddress: () => Promise<void>;
	onDeleteAddress: (addressId: number) => Promise<void>;
};

export function DeliveryAddressSection({
	form,
	addresses,
	addressesLoading,
	isCreatingAddress,
	deleteAddressIsPending,
	onCreateAddress,
	onDeleteAddress,
}: DeliveryAddressSectionProps) {
	const existingId = useId();
	const newId = useId();
	const addressMode = form.watch("addressMode");

	return (
		<div className="space-y-3 sm:space-y-4 lg:space-y-6">
			<div className="border-t pt-3 sm:pt-4 lg:pt-6">
				<h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
					<Package className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0" />
					<span>Delivery Address</span>
				</h3>
				<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
					Please provide the complete delivery address for your postal brownie
					order.
				</p>
			</div>

			{/* Address Mode Selection */}
			<FormField
				control={form.control}
				name="addressMode"
				render={({ field }) => (
					<FormItem>
						<FormControl>
							<RadioGroup
								onValueChange={field.onChange}
								defaultValue={field.value}
								value={field.value}
								className="grid grid-cols-1 sm:grid-cols-2 gap-2"
								disabled={addressesLoading}
							>
								{addresses.length > 0 && (
									<div className="flex items-center space-x-2 p-3 border rounded-lg">
										<RadioGroupItem value="existing" id={existingId} />
										<Label
											htmlFor={existingId}
											className="text-sm cursor-pointer flex-1"
										>
											Select saved address
										</Label>
									</div>
								)}
								<div className="flex items-center space-x-2 p-3 border rounded-lg">
									<RadioGroupItem value="new" id={newId} />
									<Label
										htmlFor={newId}
										className="text-sm cursor-pointer flex-1"
									>
										Add new address
									</Label>
								</div>
							</RadioGroup>
						</FormControl>
						<FormMessage className="text-xs sm:text-sm" />
					</FormItem>
				)}
			/>

			{/* Existing Address Selection */}
			{addressMode === "existing" && (
				<FormField
					control={form.control}
					name="selectedAddressId"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm sm:text-base">
								Choose Address
							</FormLabel>
							<FormControl>
								{addresses.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										<p className="text-sm">No saved addresses found</p>
										<p className="text-xs mt-1">
											Add a new address to continue
										</p>
									</div>
								) : (
									<RadioGroup
										onValueChange={(value) =>
											field.onChange(Number.parseInt(value))
										}
										defaultValue={field.value?.toString()}
										className="space-y-2"
									>
										{addresses.map((address) => (
											<div
												key={address.id}
												className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50"
											>
												<RadioGroupItem
													value={address.id.toString()}
													id={`address-${address.id}`}
													className="mt-1"
												/>
												<Label
													htmlFor={`address-${address.id}`}
													className="text-sm cursor-pointer flex-1 leading-relaxed"
												>
													<div className="space-y-1">
														<div className="font-medium">
															{address.addressLine1}
														</div>
														{address.addressLine2 && (
															<div className="text-muted-foreground">
																{address.addressLine2}
															</div>
														)}
														<div className="text-muted-foreground">
															{address.city}, {address.state} {address.zip}
														</div>
													</div>
												</Label>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => {
														onDeleteAddress(address.id);
													}}
													disabled={deleteAddressIsPending}
													title="Delete address"
												>
													{deleteAddressIsPending ? (
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
													) : (
														<Trash2 className="h-4 w-4 text-primary" />
													)}
												</Button>
											</div>
										))}
									</RadioGroup>
								)}
							</FormControl>
							<FormMessage className="text-xs sm:text-sm" />
						</FormItem>
					)}
				/>
			)}

			{/* New Address Form */}
			{addressMode === "new" && (
				<div className="space-y-3 sm:space-y-4 lg:space-y-6">
					<div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
						<FormField
							control={form.control}
							name="addressLine1"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm sm:text-base">
										Address Line 1 *
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Street address, building number"
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
							name="addressLine2"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm sm:text-base">
										Address Line 2
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Apartment, suite, unit (optional)"
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
								name="city"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm sm:text-base">
											City *
										</FormLabel>
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
								name="state"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm sm:text-base">
											State *
										</FormLabel>
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
							name="zip"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm sm:text-base">
										ZIP Code *
									</FormLabel>
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

						{/* Create Address Button */}
						<div className="pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={onCreateAddress}
								disabled={isCreatingAddress}
								className="w-full"
							>
								{isCreatingAddress ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
										Creating Address...
									</>
								) : (
									"Create & Save Address"
								)}
							</Button>
							<p className="text-xs text-muted-foreground mt-2 text-center">
								Address will be saved and automatically selected for this order
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
