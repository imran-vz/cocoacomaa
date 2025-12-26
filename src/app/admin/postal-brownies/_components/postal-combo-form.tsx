"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Minus, Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
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

const postalComboSchema = z.object({
	name: z.string().min(2, { message: "Name is required" }),
	description: z.string().min(10, { message: "Description is required" }),
	price: z.number().min(0, { message: "Price must be positive" }),
	imageUrl: z.string(),
	items: z
		.array(z.string().min(1, "Item cannot be empty"))
		.min(1, { message: "At least one item is required" }),
	status: z.enum(["available", "unavailable"]),
	containsEgg: z.boolean(),
});

type PostalComboFormData = z.infer<typeof postalComboSchema>;

interface PostalComboFormProps {
	initialData?: {
		id: number;
		name: string;
		description: string;
		price: string;
		imageUrl: string | null;
		items: string[];
		status: "available" | "unavailable";
		containsEgg: boolean;
	};
	isEdit?: boolean;
}

// API functions
async function createPostalCombo(data: PostalComboFormData) {
	const response = await fetch("/api/postal-combos", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to create postal combo");
	}

	return response.json();
}

async function updatePostalCombo(id: number, data: PostalComboFormData) {
	const response = await fetch(`/api/postal-combos/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to update postal combo");
	}

	return response.json();
}

export default function PostalComboForm({
	initialData,
	isEdit = false,
}: PostalComboFormProps) {
	const router = useRouter();
	const [isUploading, setIsUploading] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(
		initialData?.imageUrl || null,
	);
	const [grossAmount, setGrossAmount] = useState<number>(0);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Convert gross price to net price for editing
	const getInitialPrice = () => {
		if (!initialData) return 0;

		const storedPrice = Number(initialData.price);
		// If editing, convert stored gross price back to net price
		return isEdit && storedPrice > 0
			? calculateNetAmount(storedPrice, config.paymentProcessingFee)
			: storedPrice;
	};

	// Create mutation
	const createMutation = useMutation({
		mutationFn: createPostalCombo,
		onSuccess: () => {
			toast.success("Postal combo created successfully!");
			router.push("/admin/postal-brownies");
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: async (data: PostalComboFormData) => {
			if (!initialData?.id) {
				throw new Error("No ID found for update");
			}
			return updatePostalCombo(initialData.id, data);
		},
		onSuccess: () => {
			toast.success("Postal combo updated successfully!");
			router.push("/admin/postal-brownies");
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	const form = useForm({
		defaultValues: {
			name: initialData?.name || "",
			description: initialData?.description || "",
			price: getInitialPrice(),
			imageUrl: initialData?.imageUrl || "",
			items: initialData?.items ?? [""],
			status: (initialData?.status || "available") as
				| "available"
				| "unavailable",
			containsEgg: initialData?.containsEgg ?? false,
		},
		validators: {
			onSubmit: postalComboSchema,
		},
		onSubmit: async ({ value }) => {
			// Convert items array to simple string array
			const itemsArray = value.items.filter(Boolean);

			const payload = {
				...value,
				price: grossAmount, // Send gross amount instead of net
				imageUrl: value.imageUrl || undefined,
				items: itemsArray,
			};

			if (isEdit) {
				updateMutation.mutate(payload as PostalComboFormData);
			} else {
				createMutation.mutate(payload as PostalComboFormData);
			}
		},
	});

	// Calculate gross amount when price changes
	const watchPrice = useStore(form.store, (state) => state.values.price);
	useEffect(() => {
		if (typeof watchPrice === "number" && watchPrice > 0) {
			const gross = calculateGrossAmount(
				watchPrice,
				config.paymentProcessingFee,
			);
			setGrossAmount(gross);
		} else {
			setGrossAmount(0);
		}
	}, [watchPrice]);

	// Handle file upload
	const handleFileUpload = async (file: File) => {
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image size must be less than 5MB");
			return;
		}

		try {
			setIsUploading(true);

			// Generate unique filename
			const timestamp = Date.now();
			const extension = file.name.split(".").pop();
			const filename = `postal-combo-${timestamp}.${extension}`;

			// Upload to Vercel Blob
			const uploadResponse = await fetch(`/api/upload?filename=${filename}`, {
				method: "POST",
				body: file,
			});

			if (!uploadResponse.ok) {
				throw new Error("Failed to upload image");
			}

			const { url } = await uploadResponse.json();

			// Update form and preview
			form.setFieldValue("imageUrl", url);
			setImagePreview(url);
			toast.success("Image uploaded successfully!");
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Failed to upload image. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	// Handle file input change
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			handleFileUpload(file);
		}
	};

	// Handle image URL change
	const handleImageUrlChange = (url: string) => {
		form.setFieldValue("imageUrl", url);
		setImagePreview(url || null);
	};

	// Remove image
	const handleRemoveImage = () => {
		form.setFieldValue("imageUrl", "");
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Handle adding a new item to the array
	const handleAddItem = () => {
		const currentItems = form.getFieldValue("items");
		form.setFieldValue("items", [...currentItems, ""]);
	};

	// Handle removing an item from the array
	const handleRemoveItem = (index: number) => {
		const currentItems = form.getFieldValue("items");
		if (currentItems.length > 1) {
			form.setFieldValue(
				"items",
				currentItems.filter((_, i) => i !== index),
			);
		}
	};

	// Handle updating an item in the array
	const handleUpdateItem = (index: number, value: string) => {
		const currentItems = form.getFieldValue("items");
		const newItems = [...currentItems];
		newItems[index] = value;
		form.setFieldValue("items", newItems);
	};

	// Watch items for rendering
	const items = useStore(form.store, (state) => state.values.items);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* Name */}
			<form.Field
				name="name"
				// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
				children={(field) => {
					const hasErrors =
						field.state.meta.errors && field.state.meta.errors.length > 0;
					return (
						<Field data-invalid={hasErrors}>
							<FieldLabel htmlFor={field.name}>Combo Name</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="e.g., Classic Brownie Box"
							/>
							{hasErrors && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			/>

			{/* Description */}
			<form.Field
				name="description"
				// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
				children={(field) => {
					const hasErrors =
						field.state.meta.errors && field.state.meta.errors.length > 0;
					return (
						<Field data-invalid={hasErrors}>
							<FieldLabel htmlFor={field.name}>Description</FieldLabel>
							<Textarea
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Describe what's included in this combo..."
								className="min-h-25"
							/>
							{hasErrors && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			/>

			{/* Price */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<form.Field
					name="price"
					// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
					children={(field) => {
						const hasErrors =
							field.state.meta.errors && field.state.meta.errors.length > 0;
						return (
							<Field data-invalid={hasErrors}>
								<FieldLabel htmlFor={field.name}>Net Price (₹)</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="number"
									min="0"
									step="0.01"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(Number(e.target.value) || 0)
									}
									placeholder="0.00"
								/>
								{grossAmount > 0 && (
									<p className="text-sm text-muted-foreground">
										Gross Price (with {config.paymentProcessingFee}% fee): ₹
										{grossAmount}
									</p>
								)}
								{hasErrors && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</div>

			{/* Image Upload/URL */}
			<div className="space-y-4">
				<FieldLabel>Combo Image (Optional)</FieldLabel>

				{/* Image Preview */}
				{imagePreview && (
					<div className="relative inline-block">
						<Image
							src={imagePreview}
							width={128}
							height={128}
							alt="Combo preview"
							className="w-32 h-32 object-cover rounded-lg border"
						/>
						<Button
							type="button"
							variant="destructive"
							size="sm"
							className="absolute -top-2 -right-2 h-6 w-6 p-0"
							onClick={handleRemoveImage}
						>
							<X className="h-3 w-3" />
						</Button>
					</div>
				)}

				{/* Upload Button */}
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1">
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="hidden"
						/>
						<Button
							type="button"
							variant="outline"
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploading}
							className="w-full sm:w-auto"
						>
							{isUploading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
									Uploading...
								</>
							) : (
								<>
									<Upload className="h-4 w-4 mr-2" />
									Upload Image
								</>
							)}
						</Button>
					</div>
				</div>

				<div className="flex items-center text-sm text-muted-foreground">
					<div className="h-px bg-border flex-1 sm:w-8" />
					<span className="px-2">OR</span>
					<div className="h-px bg-border flex-1 sm:w-8" />
				</div>

				{/* URL Input */}
				<form.Field
					name="imageUrl"
					// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
					children={(field) => {
						const hasErrors =
							field.state.meta.errors && field.state.meta.errors.length > 0;
						return (
							<Field data-invalid={hasErrors}>
								<Input
									id={field.name}
									name={field.name}
									type="url"
									value={field.state.value ?? ""}
									onBlur={field.handleBlur}
									onChange={(e) => {
										field.handleChange(e.target.value);
										handleImageUrlChange(e.target.value);
									}}
									placeholder="https://example.com/image.jpg"
								/>
								<FieldDescription>
									Upload an image file or enter a URL
								</FieldDescription>
								{hasErrors && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</div>

			{/* Items */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<FieldLabel>Combo Items</FieldLabel>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleAddItem}
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Item
					</Button>
				</div>

				<div className="space-y-2">
					{items.map((item, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Items are simple strings without stable IDs
						<Field key={index}>
							<div className="flex gap-2">
								<Input
									value={item}
									onChange={(e) => handleUpdateItem(index, e.target.value)}
									placeholder={`Item ${index + 1} (e.g., 6 Chocolate Brownies)`}
								/>
								{items.length > 1 && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => handleRemoveItem(index)}
										className="text-red-600 hover:text-red-700"
									>
										<Minus className="h-4 w-4" />
									</Button>
								)}
							</div>
						</Field>
					))}
				</div>
			</div>

			{/* Egg Content */}
			<form.Field
				name="containsEgg"
				// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
				children={(field) => (
					<Field>
						<FieldLabel>Egg Content</FieldLabel>
						<div className="flex items-center justify-between rounded-md border p-3">
							<div className="space-y-1">
								<p className="text-sm font-medium leading-none">
									{field.state.value ? "Contains egg" : "Eggless"}
								</p>
								<p className="text-xs text-muted-foreground">
									Toggle on if this combo includes egg-based items.
								</p>
							</div>
							<Switch
								id={field.name}
								name={field.name}
								checked={field.state.value}
								onCheckedChange={field.handleChange}
							/>
						</div>
					</Field>
				)}
			/>

			{/* Status */}
			<form.Field
				name="status"
				// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
				children={(field) => {
					const hasErrors =
						field.state.meta.errors && field.state.meta.errors.length > 0;
					return (
						<Field data-invalid={hasErrors}>
							<FieldLabel htmlFor={field.name}>Status</FieldLabel>
							<Select
								value={field.state.value}
								onValueChange={(value: "available" | "unavailable") =>
									field.handleChange(value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="available">Available</SelectItem>
									<SelectItem value="unavailable">Unavailable</SelectItem>
								</SelectContent>
							</Select>
							{hasErrors && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			/>

			{/* Submit Button */}
			<div className="flex gap-4 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<form.Subscribe
					selector={(state) => state.isSubmitting}
					// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
					children={(formIsSubmitting) => (
						<Button type="submit" disabled={formIsSubmitting || isSubmitting}>
							{formIsSubmitting || isSubmitting
								? isEdit
									? "Updating..."
									: "Creating..."
								: isEdit
									? "Update Combo"
									: "Create Combo"}
						</Button>
					)}
				/>
			</div>
		</form>
	);
}
