"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
	Form,
	FormControl,
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
	imageUrl: z.string().optional(),
	status: z.enum(["available", "unavailable"]),
	category: z.enum(["cake", "dessert"]),
	leadTimeDays: z.coerce
		.number()
		.min(1, "Lead time must be at least 1 day")
		.max(30, "Lead time cannot exceed 30 days"),
});

type DessertFormValues = z.infer<typeof dessertSchema>;

interface DessertFormProps {
	mode: "create" | "edit";
	initialData?: DessertFormValues & { id?: number };
}

export function DessertForm({ mode, initialData }: DessertFormProps) {
	const router = useRouter();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>(
		initialData?.imageUrl || "",
	);
	const [uploading, setUploading] = useState(false);
	const [grossAmount, setGrossAmount] = useState<number>(0);

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
			price: netPrice,
		};
	};

	const form = useForm<DessertFormValues>({
		resolver: zodResolver(dessertSchema),
		defaultValues: getInitialData(),
	});

	// Calculate gross amount when price changes
	const watchPrice = form.watch("price");
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

	async function onSubmit(data: DessertFormValues) {
		try {
			let imageUrl = data.imageUrl;

			// Upload new image if selected
			if (selectedFile) {
				const uploadedUrl = await uploadImage();
				if (uploadedUrl) {
					imageUrl = uploadedUrl;
				} else {
					// If upload failed, don't proceed
					return;
				}
			}

			const response = await fetch(
				mode === "create"
					? "/api/desserts"
					: `/api/desserts/${initialData?.id}`,
				{
					method: mode === "create" ? "POST" : "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						...data,
						price: grossAmount.toString(), // Send gross amount instead of net
						imageUrl,
					}),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to save dessert");
			}

			toast.success(mode === "create" ? "Dessert created" : "Dessert updated");
			router.push("/admin/desserts");
			router.refresh();
		} catch (error) {
			console.error(error);
			toast.error("Something went wrong");
		}
	}

	return (
		<div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle>
						{mode === "edit" ? "Edit Dessert" : "Add New Dessert"}
					</CardTitle>
					<CardDescription>
						{mode === "edit"
							? "Update the details of your dessert"
							: "Create a new dessert item"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input placeholder="Enter dessert name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Net Price (₹)</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													placeholder="Enter net price"
													{...field}
												/>
											</FormControl>
											{grossAmount > 0 && (
												<p className="text-sm text-muted-foreground">
													Gross Price (with {config.paymentProcessingFee}% fee):
													₹{grossAmount}
												</p>
											)}
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter dessert description"
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-y-4">
								<FormLabel>Dessert Image</FormLabel>
								<div className="flex flex-col space-y-4">
									{imagePreview && (
										<div className="relative w-full max-w-sm">
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
										/>
										<p className="text-sm text-muted-foreground">
											Maximum file size: 5MB. Supported formats: JPG, PNG, WebP
										</p>
									</div>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="category"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select category" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="cake">Cake</SelectItem>
													<SelectItem value="dessert">Dessert</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="leadTimeDays"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Lead Time (Days)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="1"
													max="30"
													placeholder="Enter lead time in days"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
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

							<div className="flex justify-end gap-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={uploading}>
									{uploading
										? "Uploading..."
										: mode === "create"
											? "Create Dessert"
											: "Update Dessert"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
