"use client";

import { useForm, useStore } from "@tanstack/react-form";
import axios from "axios";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
import { formatWorkshopTime } from "@/lib/format-timestamp";
import { cn } from "@/lib/utils";

// ─── Time Slots ─────────────────────────────────────────────────
/** Available workshop time slots from 7:00 AM to 10:00 PM in 30-min increments */
const WORKSHOP_TIME_SLOTS = [
	{ value: "07:00", label: "7:00 AM" },
	{ value: "07:30", label: "7:30 AM" },
	{ value: "08:00", label: "8:00 AM" },
	{ value: "08:30", label: "8:30 AM" },
	{ value: "09:00", label: "9:00 AM" },
	{ value: "09:30", label: "9:30 AM" },
	{ value: "10:00", label: "10:00 AM" },
	{ value: "10:30", label: "10:30 AM" },
	{ value: "11:00", label: "11:00 AM" },
	{ value: "11:30", label: "11:30 AM" },
	{ value: "12:00", label: "12:00 PM" },
	{ value: "12:30", label: "12:30 PM" },
	{ value: "13:00", label: "1:00 PM" },
	{ value: "13:30", label: "1:30 PM" },
	{ value: "14:00", label: "2:00 PM" },
	{ value: "14:30", label: "2:30 PM" },
	{ value: "15:00", label: "3:00 PM" },
	{ value: "15:30", label: "3:30 PM" },
	{ value: "16:00", label: "4:00 PM" },
	{ value: "16:30", label: "4:30 PM" },
	{ value: "17:00", label: "5:00 PM" },
	{ value: "17:30", label: "5:30 PM" },
	{ value: "18:00", label: "6:00 PM" },
	{ value: "18:30", label: "6:30 PM" },
	{ value: "19:00", label: "7:00 PM" },
	{ value: "19:30", label: "7:30 PM" },
	{ value: "20:00", label: "8:00 PM" },
	{ value: "20:30", label: "8:30 PM" },
	{ value: "21:00", label: "9:00 PM" },
	{ value: "21:30", label: "9:30 PM" },
	{ value: "22:00", label: "10:00 PM" },
];

// ─── Validation Schemas ─────────────────────────────────────────

const createWorkshopSchema = z
	.object({
		title: z.string().min(1, "Title is required").max(255),
		description: z.string().min(1, "Description is required"),
		amount: z.string().min(1, "Amount is required"),
		type: z.enum(["online", "offline"]),
		maxBookings: z.string().min(1, "Max bookings is required"),
		imageUrl: z.string(),
		status: z.enum(["active", "inactive"]),
		date: z.string().min(1, "Workshop date is required"),
		startTime: z.string().min(1, "Start time is required"),
		endTime: z.string().min(1, "End time is required"),
	})
	.superRefine((data, ctx) => {
		if (data.startTime && data.endTime && data.endTime <= data.startTime) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "End time must be after start time",
				path: ["endTime"],
			});
		}
	});

const editWorkshopSchema = z
	.object({
		title: z.string().min(1, "Title is required").max(255),
		description: z.string().min(1, "Description is required"),
		amount: z.string().min(1, "Amount is required"),
		type: z.enum(["online", "offline"]),
		maxBookings: z.string().min(1, "Max bookings is required"),
		imageUrl: z.string(),
		status: z.enum(["active", "inactive"]),
		date: z.string(),
		startTime: z.string(),
		endTime: z.string(),
	})
	.superRefine((data, ctx) => {
		const hasDate = data.date.trim() !== "";
		const hasStart = data.startTime.trim() !== "";
		const hasEnd = data.endTime.trim() !== "";
		const count = [hasDate, hasStart, hasEnd].filter(Boolean).length;

		if (count > 0 && count < 3) {
			if (!hasDate) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Date is required when setting a schedule",
					path: ["date"],
				});
			}
			if (!hasStart) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Start time is required when setting a schedule",
					path: ["startTime"],
				});
			}
			if (!hasEnd) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "End time is required when setting a schedule",
					path: ["endTime"],
				});
			}
		}

		if (hasStart && hasEnd && data.endTime <= data.startTime) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "End time must be after start time",
				path: ["endTime"],
			});
		}
	});

// ─── Types ──────────────────────────────────────────────────────

interface WorkshopFormProps {
	mode: "create" | "edit";
	initialData?: {
		id?: number;
		title: string;
		description: string;
		amount: string;
		type: "online" | "offline";
		maxBookings: string;
		imageUrl?: string;
		status?: "active" | "inactive";
		date?: string | null;
		startTime?: string | null;
		endTime?: string | null;
	};
}

// ─── Component ──────────────────────────────────────────────────

export function WorkshopForm({ mode, initialData }: WorkshopFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(
		initialData?.imageUrl || null,
	);
	const [uploading, setUploading] = useState(false);
	const [grossAmount, setGrossAmount] = useState<number>(0);
	const [datePickerOpen, setDatePickerOpen] = useState(false);

	// Convert gross price to net price for editing
	const getInitialData = () => {
		if (!initialData) {
			return {
				title: "",
				description: "",
				amount: "",
				type: "online" as const,
				maxBookings: "10",
				imageUrl: "",
				status: "active" as const,
				date: "",
				startTime: "",
				endTime: "",
			};
		}

		// If editing, convert stored gross price back to net price
		const storedPrice = parseFloat(initialData.amount);
		const netPrice =
			mode === "edit" && !Number.isNaN(storedPrice) && storedPrice > 0
				? calculateNetAmount(
						storedPrice,
						config.paymentProcessingFee,
					).toString()
				: initialData.amount;

		return {
			...initialData,
			amount: netPrice,
			maxBookings: initialData.maxBookings?.toString() || "10",
			imageUrl: initialData.imageUrl || "",
			status: initialData.status || ("active" as const),
			date: initialData.date || "",
			startTime: initialData.startTime || "",
			endTime: initialData.endTime || "",
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
			onSubmit: mode === "create" ? createWorkshopSchema : editWorkshopSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			try {
				let imageUrl = value.imageUrl;

				// Upload new image if selected
				if (selectedFile) {
					const uploadedUrl = await uploadImage();
					if (uploadedUrl) {
						imageUrl = uploadedUrl;
					} else {
						// If upload failed, don't proceed
						setIsSubmitting(false);
						return;
					}
				}

				const submissionData = {
					...value,
					amount: grossAmount.toString(), // Send gross amount instead of net
					imageUrl,
					date: value.date || null,
					startTime: value.startTime || null,
					endTime: value.endTime || null,
				};

				if (mode === "edit" && initialData?.id) {
					await axios.put(`/api/workshops/${initialData.id}`, submissionData);
					toast.success("Workshop updated successfully!");
				} else {
					await axios.post("/api/workshops", submissionData);
					toast.success("Workshop created successfully!");
				}

				router.push("/admin/workshops");
			} catch (error) {
				console.error("Error saving workshop:", error);
				if (axios.isAxiosError(error)) {
					toast.error(
						error.response?.data?.message || "Failed to save workshop",
					);
				} else {
					toast.error("Failed to save workshop");
				}
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	// Calculate gross amount when amount changes
	const watchAmount = useStore(form.store, (state) => state.values.amount);
	useEffect(() => {
		const netPrice = parseFloat(watchAmount);
		if (!Number.isNaN(netPrice) && netPrice > 0) {
			const gross = calculateGrossAmount(netPrice, config.paymentProcessingFee);
			setGrossAmount(gross);
		} else {
			setGrossAmount(0);
		}
	}, [watchAmount]);

	useEffect(() => {
		if (mode === "edit" && !initialData) {
			toast.error("Failed to load workshop data");
			router.push("/admin/workshops");
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

	// Parse a date string (YYYY-MM-DD) into a Date at noon to avoid timezone shift
	const parseDateString = (dateStr: string): Date | undefined => {
		if (!dateStr) return undefined;
		const d = new Date(`${dateStr}T12:00:00`);
		return Number.isNaN(d.getTime()) ? undefined : d;
	};

	// Watch startTime to filter end time options
	const watchStartTime = useStore(
		form.store,
		(state) => state.values.startTime,
	);
	const availableEndTimeSlots = watchStartTime
		? WORKSHOP_TIME_SLOTS.filter((slot) => slot.value > watchStartTime)
		: WORKSHOP_TIME_SLOTS;

	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="flex items-center gap-4 mb-6">
				<Button variant="outline" size="icon" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">
						{mode === "edit" ? "Edit Workshop" : "Create Workshop"}
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{mode === "edit"
							? "Update workshop details"
							: "Add a new workshop offering"}
					</p>
				</div>
			</div>

			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle>Workshop Details</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
						<FieldGroup>
							<form.Field
								name="title"
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Title</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Workshop title"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

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
												placeholder="Describe what participants will learn..."
												className="min-h-25"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<div className="grid grid-cols-1 place-items-start md:grid-cols-3 gap-4">
								<form.Field
									name="amount"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Net Amount (₹)
												</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													type="number"
													step="0.01"
													min="0"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="Enter net amount"
												/>
												<FieldDescription className="min-h-5">
													Gross Amount (with {config.paymentProcessingFee}%
													fee): ₹{grossAmount.toFixed(2)}
												</FieldDescription>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="type"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid} className="w-full">
												<FieldLabel htmlFor={field.name}>Type</FieldLabel>
												<Select
													name={field.name}
													value={field.state.value}
													onValueChange={(value) =>
														field.handleChange(value as "online" | "offline")
													}
												>
													<SelectTrigger
														id={field.name}
														aria-invalid={isInvalid}
													>
														<SelectValue placeholder="Select workshop type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="online">Online</SelectItem>
														<SelectItem value="offline">Offline</SelectItem>
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
									name="maxBookings"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Max Bookings
												</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													type="number"
													min="1"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="10"
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</div>

							{/* ─── Date & Time Section ─────────────────────── */}
							<div className="space-y-4 rounded-lg border p-4">
								<div className="flex items-center gap-2 mb-1">
									<CalendarIcon className="h-4 w-4 text-muted-foreground" />
									<FieldLabel className="text-base font-semibold">
										Workshop Schedule
									</FieldLabel>
									{mode === "edit" && (
										<span className="text-xs text-muted-foreground ml-auto">
											Optional for existing workshops
										</span>
									)}
								</div>

								{/* Date Picker */}
								<form.Field
									name="date"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const hasErrors =
											field.state.meta.errors &&
											field.state.meta.errors.length > 0;
										const isInvalid = field.state.meta.isTouched && hasErrors;
										const selectedDate = parseDateString(field.state.value);
										return (
											<Field data-invalid={isInvalid} className="flex flex-col">
												<FieldLabel htmlFor={field.name}>
													Date{mode === "create" && " *"}
												</FieldLabel>
												<Popover
													open={datePickerOpen}
													onOpenChange={setDatePickerOpen}
												>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className={cn(
																"w-full justify-between text-left font-normal",
																!field.state.value && "text-muted-foreground",
															)}
														>
															<span className="truncate">
																{selectedDate
																	? format(selectedDate, "EEEE, MMM d, yyyy")
																	: "Select workshop date"}
															</span>
															<CalendarIcon className="h-4 w-4 opacity-50 shrink-0 ml-2" />
														</Button>
													</PopoverTrigger>
													<PopoverContent
														className="w-auto p-0 z-50"
														align="start"
														side="bottom"
														sideOffset={4}
													>
														<Calendar
															mode="single"
															selected={selectedDate}
															onSelect={(date) => {
																if (date) {
																	// Format to YYYY-MM-DD
																	const yyyy = date.getFullYear();
																	const mm = String(
																		date.getMonth() + 1,
																	).padStart(2, "0");
																	const dd = String(date.getDate()).padStart(
																		2,
																		"0",
																	);
																	field.handleChange(`${yyyy}-${mm}-${dd}`);
																} else {
																	field.handleChange("");
																}
																setDatePickerOpen(false);
															}}
															initialFocus
															className="rounded-md border-0"
														/>
													</PopoverContent>
												</Popover>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								{/* Start Time & End Time */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<form.Field
										name="startTime"
										// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
										children={(field) => {
											const hasErrors =
												field.state.meta.errors &&
												field.state.meta.errors.length > 0;
											const isInvalid = field.state.meta.isTouched && hasErrors;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name}>
														<Clock className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
														Start Time{mode === "create" && " *"}
													</FieldLabel>
													<Select
														name={field.name}
														value={field.state.value || undefined}
														onValueChange={(value) => {
															field.handleChange(value);
															// Clear endTime if it's now invalid
															const currentEndTime =
																form.getFieldValue("endTime");
															if (currentEndTime && currentEndTime <= value) {
																form.setFieldValue("endTime", "");
															}
														}}
													>
														<SelectTrigger
															id={field.name}
															aria-invalid={isInvalid}
															className={cn(
																!field.state.value && "text-muted-foreground",
															)}
														>
															<SelectValue placeholder="Select start time" />
														</SelectTrigger>
														<SelectContent className="max-h-60">
															{WORKSHOP_TIME_SLOTS.map((slot) => (
																<SelectItem key={slot.value} value={slot.value}>
																	{slot.label}
																</SelectItem>
															))}
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
										name="endTime"
										// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
										children={(field) => {
											const hasErrors =
												field.state.meta.errors &&
												field.state.meta.errors.length > 0;
											const isInvalid = field.state.meta.isTouched && hasErrors;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name}>
														<Clock className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
														End Time{mode === "create" && " *"}
													</FieldLabel>
													<Select
														name={field.name}
														value={field.state.value || undefined}
														onValueChange={field.handleChange}
													>
														<SelectTrigger
															id={field.name}
															aria-invalid={isInvalid}
															className={cn(
																!field.state.value && "text-muted-foreground",
															)}
														>
															<SelectValue placeholder="Select end time" />
														</SelectTrigger>
														<SelectContent className="max-h-60">
															{availableEndTimeSlots.map((slot) => (
																<SelectItem key={slot.value} value={slot.value}>
																	{slot.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									/>
								</div>

								{/* Schedule Summary */}
								{watchStartTime && (
									<FieldDescription>
										{watchStartTime && form.getFieldValue("endTime")
											? `${formatWorkshopTime(watchStartTime)} - ${formatWorkshopTime(form.getFieldValue("endTime"))}`
											: `Starts at ${formatWorkshopTime(watchStartTime)}`}
									</FieldDescription>
								)}
							</div>

							<div className="space-y-4">
								<FieldLabel>Workshop Image</FieldLabel>
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
										/>
										<p className="text-sm text-muted-foreground">
											Upload an image to represent this workshop (max 5MB)
										</p>
									</div>
								</div>
							</div>

							{mode === "edit" && (
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
														field.handleChange(value as "active" | "inactive")
													}
												>
													<SelectTrigger
														id={field.name}
														aria-invalid={isInvalid}
													>
														<SelectValue placeholder="Select status" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="active">Active</SelectItem>
														<SelectItem value="inactive">Inactive</SelectItem>
														<SelectItem value="completed">Completed</SelectItem>
													</SelectContent>
												</Select>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							)}
						</FieldGroup>

						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
								className="order-2 sm:order-1"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting || uploading}
								className="order-1 sm:order-2"
							>
								{uploading
									? "Uploading image..."
									: isSubmitting
										? mode === "edit"
											? "Updating..."
											: "Creating..."
										: mode === "edit"
											? "Update Workshop"
											: "Create Workshop"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
