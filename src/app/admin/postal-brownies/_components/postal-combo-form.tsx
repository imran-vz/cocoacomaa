"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Minus, Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
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
	imageUrl: z.string().url().optional().or(z.literal("")),
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

	const form = useForm<PostalComboFormData>({
		resolver: zodResolver(postalComboSchema),
		defaultValues: {
			name: initialData?.name || "",
			description: initialData?.description || "",
			price: getInitialPrice(),
			imageUrl: initialData?.imageUrl || "",
			items: initialData?.items ?? [],
			status: initialData?.status || "available",
			containsEgg: initialData?.containsEgg ?? false,
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		// @ts-ignore
		name: "items" as const,
	});

	// Calculate gross amount when price changes
	const watchPrice = form.watch("price");
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
			form.setValue("imageUrl", url);
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
		form.setValue("imageUrl", url);
		setImagePreview(url || null);
	};

	// Remove image
	const handleRemoveImage = () => {
		form.setValue("imageUrl", "");
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const onSubmit = async (data: PostalComboFormData) => {
		// Convert items array to simple string array
		const itemsArray = data.items.filter(Boolean);

		const payload = {
			...data,
			price: grossAmount, // Send gross amount instead of net
			imageUrl: data.imageUrl || undefined,
			items: itemsArray,
		};

		if (isEdit) {
			updateMutation.mutate(payload);
		} else {
			createMutation.mutate(payload);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Name */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Combo Name</FormLabel>
							<FormControl>
								<Input placeholder="e.g., Classic Brownie Box" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Description */}
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Describe what's included in this combo..."
									className="min-h-[100px]"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Price and Type */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="price"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Net Price (₹)</FormLabel>
								<FormControl>
									<Input
										type="number"
										min="0"
										step="0.01"
										placeholder="0.00"
										{...field}
										onChange={(e) =>
											field.onChange(Number(e.target.value) || 0)
										}
									/>
								</FormControl>
								{grossAmount > 0 && (
									<p className="text-sm text-muted-foreground">
										Gross Price (with {config.paymentProcessingFee}% fee): ₹
										{grossAmount}
									</p>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Image Upload/URL */}
				<div className="space-y-4">
					<FormLabel>Combo Image (Optional)</FormLabel>

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

						{/* OR Divider */}
					</div>

					<div className="flex items-center text-sm text-muted-foreground">
						<div className="h-px bg-border flex-1 sm:w-8" />
						<span className="px-2">OR</span>
						<div className="h-px bg-border flex-1 sm:w-8" />
					</div>

					{/* URL Input */}
					<FormField
						control={form.control}
						name="imageUrl"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										type="url"
										placeholder="https://example.com/image.jpg"
										{...field}
										onChange={(e) => {
											field.onChange(e);
											handleImageUrlChange(e.target.value);
										}}
									/>
								</FormControl>
								<FormDescription>
									Upload an image file or enter a URL
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Items */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<FormLabel>Combo Items</FormLabel>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => append("")}
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Item
						</Button>
					</div>

					<div className="space-y-2">
						{fields.map((field, index) => (
							<FormField
								key={field.id}
								control={form.control}
								name={`items.${index}`}
								render={({ field: itemField }) => (
									<FormItem>
										<div className="flex gap-2">
											<FormControl>
												<Input
													placeholder={`Item ${index + 1} (e.g., 6 Chocolate Brownies)`}
													{...itemField}
												/>
											</FormControl>
											{fields.length > 1 && (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => remove(index)}
													className="text-red-600 hover:text-red-700"
												>
													<Minus className="h-4 w-4" />
												</Button>
											)}
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
					</div>
				</div>

				{/* Egg Content */}
				<FormField
					control={form.control}
					name="containsEgg"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Egg Content</FormLabel>
							<div className="flex items-center justify-between rounded-md border p-3">
								<div className="space-y-1">
									<p className="text-sm font-medium leading-none">
										{field.value ? "Contains egg" : "Eggless"}
									</p>
									<p className="text-xs text-muted-foreground">
										Toggle on if this combo includes egg-based items.
									</p>
								</div>
								<FormControl>
									<Switch
										name={field.name}
										ref={field.ref}
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Status */}
				<FormField
					control={form.control}
					name="status"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Status</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="available">Available</SelectItem>
									<SelectItem value="unavailable">Unavailable</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
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
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting
							? isEdit
								? "Updating..."
								: "Creating..."
							: isEdit
								? "Update Combo"
								: "Create Combo"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
