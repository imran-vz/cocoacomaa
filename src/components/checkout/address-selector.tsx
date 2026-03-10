"use client";

import { Package, Trash2 } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ─── Types ──────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: TanStack Form field API
type FieldApi = any;

interface Address {
	id: number;
	addressLine1: string;
	addressLine2?: string | null;
	city: string;
	state: string;
	zip: string;
}

interface AddressSelectorProps {
	/** The TanStack form instance */
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form field API
	form: any;
	/** Current address mode value from form */
	addressMode: "existing" | "new" | undefined;
	/** List of saved addresses */
	addresses: Address[];
	/** Whether addresses are still loading */
	addressesLoading: boolean;
	/** Whether an address is currently being created */
	isCreatingAddress: boolean;
	/** Whether the delete mutation is pending */
	isDeletePending: boolean;
	/** Callback to create a new address */
	onCreateAddress: () => void;
	/** Callback to delete an address */
	onDeleteAddress: (addressId: number) => void;
}

/**
 * Address selection and creation component for postal brownie orders.
 * Provides:
 * - Radio toggle between "Select saved address" and "Add new address"
 * - Saved address list with selection and deletion
 * - New address form with create & save button
 */
export function AddressSelector({
	form,
	addressMode,
	addresses,
	addressesLoading,
	isCreatingAddress,
	isDeletePending,
	onCreateAddress,
	onDeleteAddress,
}: AddressSelectorProps) {
	const existingId = useId();
	const newId = useId();

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
			<form.Field
				name="addressMode"
				// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
				children={(field: FieldApi) => {
					const hasErrors =
						field.state.meta.errors && field.state.meta.errors.length > 0;
					return (
						<Field data-invalid={hasErrors}>
							<RadioGroup
								onValueChange={(value: string) =>
									field.handleChange(value as "existing" | "new")
								}
								value={field.state.value}
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

			{/* Existing Address Selection */}
			{addressMode === "existing" && (
				<form.Field
					name="selectedAddressId"
					// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
					children={(field: FieldApi) => {
						const hasErrors =
							field.state.meta.errors && field.state.meta.errors.length > 0;
						return (
							<Field data-invalid={hasErrors}>
								<FieldLabel className="text-sm sm:text-base">
									Choose Address
								</FieldLabel>
								{addresses.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										<p className="text-sm">No saved addresses found</p>
										<p className="text-xs mt-1">
											Add a new address to continue
										</p>
									</div>
								) : (
									<RadioGroup
										onValueChange={(value: string) =>
											field.handleChange(Number.parseInt(value))
										}
										value={field.state.value?.toString()}
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
													disabled={isDeletePending}
													title="Delete address"
												>
													{isDeletePending ? (
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
													) : (
														<Trash2 className="h-4 w-4 text-primary" />
													)}
												</Button>
											</div>
										))}
									</RadioGroup>
								)}
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

			{/* New Address Form */}
			{addressMode === "new" && (
				<div className="space-y-3 sm:space-y-4 lg:space-y-6">
					<div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
						<form.Field
							name="addressLine1"
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
											Address Line 1 *
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												field.handleChange(e.target.value)
											}
											placeholder="Street address, building number"
											className="text-sm sm:text-base"
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
							name="addressLine2"
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
											Address Line 2
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												field.handleChange(e.target.value)
											}
											placeholder="Apartment, suite, unit (optional)"
											className="text-sm sm:text-base"
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

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
							<form.Field
								name="city"
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(field: FieldApi) => {
									const hasErrors =
										field.state.meta.errors &&
										field.state.meta.errors.length > 0;
									return (
										<Field data-invalid={hasErrors}>
											<FieldLabel
												htmlFor={field.name}
												className="text-sm sm:text-base"
											>
												City *
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value ?? ""}
												onBlur={field.handleBlur}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
													field.handleChange(e.target.value)
												}
												placeholder="City"
												className="text-sm sm:text-base"
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
								name="state"
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(field: FieldApi) => {
									const hasErrors =
										field.state.meta.errors &&
										field.state.meta.errors.length > 0;
									return (
										<Field data-invalid={hasErrors}>
											<FieldLabel
												htmlFor={field.name}
												className="text-sm sm:text-base"
											>
												State *
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value ?? ""}
												onBlur={field.handleBlur}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
													field.handleChange(e.target.value)
												}
												placeholder="State"
												className="text-sm sm:text-base"
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
						</div>

						<form.Field
							name="zip"
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
											ZIP Code *
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												field.handleChange(e.target.value)
											}
											placeholder="ZIP Code"
											className="text-sm sm:text-base"
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
