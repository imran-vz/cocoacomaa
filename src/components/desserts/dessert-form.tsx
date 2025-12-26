"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	calculateGrossAmount,
	calculateNetAmount,
} from "@/lib/calculateGrossAmount";
import { config } from "@/lib/config";

const dessertSchema = z.object({
	name: z.string().min(1, "Name is required"),
	price: z.string().min(1, "Price is required"),
	description: z.string().min(1, "Description is required"),
	imageUrl: z.string(),
	status: z.enum(["available", "unavailable"]),
	category: z.enum(["cake", "dessert", "special"]),
	containsEgg: z.boolean(),
	leadTimeDays: z
		.number()
		.int()
		.min(1, "Lead time must be at least 1 day")
		.max(30, "Lead time cannot exceed 30 days"),
});

interface DessertFormProps {
	mode: "create" | "edit";
	initialData?: {
		id?: number;
		name: string;
		price: string;
		description: string;
		imageUrl?: string;
		status: "available" | "unavailable";
		category: "cake" | "dessert" | "special";
		containsEgg: boolean;
		leadTimeDays: number;
	};
}

export function DessertForm({ mode, initialData }: DessertFormProps) {
	const router = useRouter();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>(
		initialData?.imageUrl || "",
	);
	const [uploading, setUploading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [grossAmount, setGrossAmount] = useState<number>(0);

	// Check if we're dealing with specials
	const isSpecial = initialData?.category === "special";

	// Convert gross price to net price for editing
	const getInitialData = () => {
		if (!initialData) {
			return {
				name: "",
				price: "",
				description: "",
				imageUrl: "",
				status: "available" as const,
				category: "dessert" as const,
				containsEgg: false,
				leadTimeDays: 3,
			};
		}

		// If editing, convert stored gross price back to net price
		const storedPrice = parseFloat(initialData.price);
		const netPrice =
			mode === "edit" && !Number.isNaN(storedPrice) && storedPrice > 0
				? calculateNetAmount(
						storedPrice,
						config.paymentProcessingFee,
					).toString()
				: initialData.price;

		return {
			...initialData,
			containsEgg: initialData.containsEgg ?? false,
			price: netPrice,
			imageUrl: initialData.imageUrl || "",
		};
	};

	const uploadImage = async (): Promise<string | null> => {
		if (!selectedFile) return null;

		setUploading(true);
		try {
			const response = await fetch(
				`/api/upload?filename=${encodeURIComponent(selectedFile.name)}`,
				{
					method: "POST",
					body: selectedFile,
				},
			);

			if (!response.ok) {
				throw new Error("Failed to upload image");
			}

			const { url } = await response.json();
			return url;
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Failed to upload image");
			return null;
		} finally {
			setUploading(false);
		}
	};

	const form = useForm({
		defaultValues: getInitialData(),
		validators: {
			onSubmit: dessertSchema,
		},
		onSubmit: async ({ value }) => {
			if (isSubmitting) return;

			setIsSubmitting(true);
			try {
				let imageUrl = value.imageUrl;

				// Upload new image if selected
				if (selectedFile) {
					const uploadedUrl = await uploadImage();
					if (uploadedUrl) {
						imageUrl = uploadedUrl;
					} else {
						toast.error("Failed to upload image");
						// If upload failed, don't proceed
						setIsSubmitting(false);
						return;
					}
				}

				// For specials, ensure category is set to "special" and set default leadTimeDays
				const submitData = {
					...value,
					price: grossAmount.toString(), // Send gross amount instead of net
					imageUrl,
					...(isSpecial && {
						category: "special" as const,
						leadTimeDays: 0, // Default lead time for specials
					}),
				};

				const response = await fetch(
					mode === "create"
						? "/api/desserts"
						: `/api/desserts/${initialData?.id}`,
					{
						method: mode === "create" ? "POST" : "PATCH",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(submitData),
					},
				);

				if (!response.ok) {
					throw new Error("Failed to save dessert");
				}

				toast.success(
					mode === "create"
						? isSpecial
							? "Special created"
							: "Dessert created"
						: isSpecial
							? "Special updated"
							: "Dessert updated",
				);
				// Redirect to specials page if it's a special, otherwise desserts page
				router.push(isSpecial ? "/admin/specials" : "/admin/desserts");
				router.refresh();
			} catch (error) {
				console.error(error);
				toast.error("Something went wrong");
				setIsSubmitting(false);
			}
		},
	});

	// Calculate gross amount when price changes
	const watchPrice = useStore(form.store, (state) => state.values.price);

	useEffect(() => {
		const netPrice = parseFloat(watchPrice);
		if (!Number.isNaN(netPrice) && netPrice > 0) {
			const gross = calculateGrossAmount(netPrice, config.paymentProcessingFee);
			setGrossAmount(gross);
		} else {
			setGrossAmount(0);
		}
	}, [watchPrice]);

	useEffect(() => {
		if (mode === "edit" && !initialData) {
			toast.error("Failed to load dessert data");
			router.push("/admin");
		}
	}, [mode, initialData, router]);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				// 5MB limit
				toast.error("File size must be less than 5MB");
				return;
			}

			if (!file.type.startsWith("image/")) {
				toast.error("Please select an image file");
				return;
			}

			setSelectedFile(file);

			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle>
						{mode === "edit"
							? isSpecial
								? "Edit Special"
								: "Edit Dessert"
							: isSpecial
								? "Add New Special"
								: "Add New Dessert"}
					</CardTitle>
					<CardDescription>
						{mode === "edit"
							? isSpecial
								? "Update the details of your special"
								: "Update the details of your dessert"
							: isSpecial
								? "Create a new special item"
								: "Create a new dessert item"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-8"
					>
						<FieldGroup>
							<div className="grid gap-4 md:grid-cols-2">
								<form.Field
									name="name"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Name</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder={
														isSpecial
															? "Enter special name"
															: "Enter dessert name"
													}
													disabled={isSubmitting || uploading}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="price"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Net Price (₹)
												</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													type="number"
													step="0.01"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="Enter net price"
													disabled={isSubmitting || uploading}
												/>
												{grossAmount > 0 && (
													<FieldDescription>
														Gross Price (with {config.paymentProcessingFee}%
														fee): ₹{grossAmount}
													</FieldDescription>
												)}
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</div>

							<form.Field
								name="description"
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Description</FieldLabel>
											<Textarea
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder={
													isSpecial
														? "Enter special description"
														: "Enter dessert description"
												}
												className="min-h-[100px]"
												disabled={isSubmitting || uploading}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<div className="space-y-4">
								<FieldLabel>
									{isSpecial ? "Special" : "Dessert"} Image
								</FieldLabel>
								<div className="flex flex-col space-y-4">
									{imagePreview && (
										<div className="relative w-full max-w-sm">
											{/** biome-ignore lint/a11y/useAltText: preview image */}
											{/** biome-ignore lint/performance/noImgElement: this is only for preview */}
											<img
												src={imagePreview}
												alt="Preview"
												className="w-full h-48 object-cover rounded-lg"
											/>
										</div>
									)}
									<div className="flex flex-col space-y-2">
										<Input
											type="file"
											accept="image/*"
											onChange={handleFileSelect}
											className="cursor-pointer"
											disabled={isSubmitting || uploading}
										/>
										<p className="text-sm text-muted-foreground">
											Maximum file size: 5MB. Supported formats: JPG, PNG, WebP
										</p>
									</div>
								</div>
							</div>

							{/* Category and Lead Time */}
							{!isSpecial && (
								<div className="grid gap-4 md:grid-cols-2">
									<form.Field
										name="category"
										// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
										children={(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name}>Category</FieldLabel>
													<Select
														name={field.name}
														value={field.state.value}
														onValueChange={(value) =>
															field.handleChange(
																value as "cake" | "dessert" | "special",
															)
														}
														disabled={isSubmitting || uploading}
													>
														<SelectTrigger
															id={field.name}
															aria-invalid={isInvalid}
														>
															<SelectValue placeholder="Select category" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="cake">Cake</SelectItem>
															<SelectItem value="dessert">Dessert</SelectItem>
															<SelectItem value="special">Special</SelectItem>
														</SelectContent>
													</Select>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									/>

									<form.Field
										name="leadTimeDays"
										// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
										children={(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name}>
														Lead Time (Days)
													</FieldLabel>
													<Input
														id={field.name}
														name={field.name}
														type="number"
														min="1"
														max="30"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) =>
															field.handleChange(Number(e.target.value) || 0)
														}
														aria-invalid={isInvalid}
														placeholder="Enter lead time in days"
														disabled={isSubmitting || uploading}
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									/>
								</div>
							)}

							<form.Field
								name="containsEgg"
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>Egg Content</FieldLabel>
											<div className="flex items-center justify-between rounded-md border p-3">
												<div className="space-y-1">
													<p className="text-sm font-medium leading-none">
														{field.state.value ? "Contains egg" : "Eggless"}
													</p>
													<p className="text-xs text-muted-foreground">
														Toggle on if this item includes egg ingredients.
													</p>
												</div>
												<Switch
													id={field.name}
													name={field.name}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={isSubmitting || uploading}
												/>
											</div>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<form.Field
								name="status"
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Status</FieldLabel>
											<Select
												name={field.name}
												value={field.state.value}
												onValueChange={(value) =>
													field.handleChange(
														value as "available" | "unavailable",
													)
												}
												disabled={isSubmitting || uploading}
											>
												<SelectTrigger id={field.name} aria-invalid={isInvalid}>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="available">Available</SelectItem>
													<SelectItem value="unavailable">
														Unavailable
													</SelectItem>
												</SelectContent>
											</Select>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
						</FieldGroup>

						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
								disabled={isSubmitting || uploading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting || uploading}>
								{uploading
									? "Uploading..."
									: isSubmitting
										? mode === "create"
											? isSpecial
												? "Creating Special..."
												: "Creating Dessert..."
											: isSpecial
												? "Updating Special..."
												: "Updating Dessert..."
										: mode === "create"
											? isSpecial
												? "Create Special"
												: "Create Dessert"
											: isSpecial
												? "Update Special"
												: "Update Dessert"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
