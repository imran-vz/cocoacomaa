"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { confirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

const postalOrderSettingsSchema = z
	.object({
		name: z
			.string()
			.min(1, "Name is required")
			.max(100, "Name must be less than 100 characters"),
		orderDateRange: z
			.object({
				from: z.date({ required_error: "Order start date is required" }),
				to: z.date({ required_error: "Order end date is required" }),
			})
			.refine((range) => range.from && range.to && range.from <= range.to, {
				message: "Order end date must be on or after start date",
			}),
		dispatchDateRange: z
			.object({
				from: z.date({ required_error: "Dispatch start date is required" }),
				to: z.date({ required_error: "Dispatch end date is required" }),
			})
			.refine((range) => range.from && range.to && range.from <= range.to, {
				message: "Dispatch end date must be on or after start date",
			}),
		isActive: z.boolean(),
	})
	.refine(
		(data) => {
			// Check if periods don't overlap (order end must be before dispatch start)
			if (data.orderDateRange.to >= data.dispatchDateRange.from) return false;
			return true;
		},
		{
			message:
				"Order and dispatch periods must not overlap - order period must end before dispatch period starts",
		},
	);

type PostalOrderSettingsFormData = z.infer<typeof postalOrderSettingsSchema>;

interface PostalOrderSettings {
	id: number;
	name: string;
	month: string;
	orderStartDate: string;
	orderEndDate: string;
	dispatchStartDate: string;
	dispatchEndDate: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

interface PostalOrderSettingsClientProps {
	initialSettings: PostalOrderSettings[];
	currentMonth: string;
}

export function PostalOrderSettingsClient({
	initialSettings,
	currentMonth,
}: PostalOrderSettingsClientProps) {
	const queryClient = useQueryClient();
	const [editingId, setEditingId] = useState<number | null>(null);
	const [currentMonthSettings, setCurrentMonthSettings] =
		useState<PostalOrderSettings[]>(initialSettings);

	// Helper function to convert local date to UTC date string
	const toUTCDateString = (date: Date) => {
		return new Date(
			Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
		)
			.toISOString()
			.split("T")[0];
	};

	// Helper function to convert UTC date string to local Date object
	const fromUTCDateString = (dateString: string) => {
		const parts = dateString.split("-").map(Number);
		return new Date(parts[0], parts[1] - 1, parts[2]);
	};

	const form = useForm<PostalOrderSettingsFormData>({
		resolver: zodResolver(postalOrderSettingsSchema),
		defaultValues: {
			name: "",
			orderDateRange: { from: undefined, to: undefined },
			dispatchDateRange: { from: undefined, to: undefined },
			isActive: true,
		},
	});

	// Watch both date ranges to enable cross-validation
	const orderDateRange = form.watch("orderDateRange");
	const dispatchDateRange = form.watch("dispatchDateRange");

	const isDateInCurrentMonth = (date: Date) => {
		// Convert to UTC for consistent comparison
		const utcDate = new Date(
			Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
		);
		const utcCurrentMonthStart = new Date(
			Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
		);
		const utcCurrentMonthEnd = new Date(
			Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0),
		);
		return utcDate >= utcCurrentMonthStart && utcDate <= utcCurrentMonthEnd;
	};

	// Check if a date is within a given date range
	const isDateInRange = (
		date: Date,
		range: { from?: Date; to?: Date } | undefined,
	) => {
		if (!range?.from || !range?.to) return false;
		return date >= range.from && date <= range.to;
	};

	// Check if a date is used in existing slots (excluding the currently editing slot)
	const isDateUsedInExistingSlots = (date: Date) => {
		return currentMonthSettings.some((setting) => {
			// Skip the slot we're currently editing
			if (editingId && setting.id === editingId) return false;

			// Convert input date to UTC date string for comparison
			const utcDateString = toUTCDateString(date);

			// Check if date falls within order period (dates in DB are already in YYYY-MM-DD format)
			if (
				utcDateString >= setting.orderStartDate &&
				utcDateString <= setting.orderEndDate
			)
				return true;

			// Check if date falls within dispatch period
			if (
				utcDateString >= setting.dispatchStartDate &&
				utcDateString <= setting.dispatchEndDate
			)
				return true;

			return false;
		});
	};

	// Disable dates for order period calendar
	const isOrderDateDisabled = (date: Date) => {
		// Disable if not in current month
		if (!isDateInCurrentMonth(date)) return true;
		// Disable if date is in dispatch period of current form
		if (isDateInRange(date, dispatchDateRange)) return true;
		// Disable if date is already used in existing slots
		if (isDateUsedInExistingSlots(date)) return true;
		return false;
	};

	// Disable dates for dispatch period calendar
	const isDispatchDateDisabled = (date: Date) => {
		// Disable if not in current month
		if (!isDateInCurrentMonth(date)) return true;
		// Disable if date is in order period of current form
		if (isDateInRange(date, orderDateRange)) return true;
		// Disable if date is already used in existing slots
		if (isDateUsedInExistingSlots(date)) return true;
		return false;
	};

	// Create settings mutation
	const createMutation = useMutation({
		mutationFn: async (data: {
			name: string;
			month: string;
			orderStartDate: string;
			orderEndDate: string;
			dispatchStartDate: string;
			dispatchEndDate: string;
			isActive: boolean;
		}) => {
			const response = await fetch("/api/postal-order-settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to create settings");
			}

			return response.json();
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["postal-order-settings"] });
			setCurrentMonthSettings((prev) => [...prev, data.settings]);
		},
	});

	// Update settings mutation
	const updateMutation = useMutation({
		mutationFn: async (data: {
			id: number;
			name: string;
			month: string;
			orderStartDate: string;
			orderEndDate: string;
			dispatchStartDate: string;
			dispatchEndDate: string;
			isActive: boolean;
		}) => {
			const response = await fetch("/api/postal-order-settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update settings");
			}

			return response.json();
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["postal-order-settings"] });
			setCurrentMonthSettings((prev) =>
				prev.map((s) => (s.id === data.settings.id ? data.settings : s)),
			);
		},
	});

	// Delete settings mutation
	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/postal-order-settings?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to delete settings");
			}

			return response.json();
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ["postal-order-settings"] });
			setCurrentMonthSettings((prev) => prev.filter((s) => s.id !== id));
		},
	});

	const onSubmit = async (data: PostalOrderSettingsFormData) => {
		try {
			// Convert date ranges to UTC string format for API and add current month
			const formattedData = {
				name: data.name,
				month: currentMonth,
				orderStartDate: toUTCDateString(data.orderDateRange.from),
				orderEndDate: toUTCDateString(data.orderDateRange.to),
				dispatchStartDate: toUTCDateString(data.dispatchDateRange.from),
				dispatchEndDate: toUTCDateString(data.dispatchDateRange.to),
				isActive: data.isActive,
			};

			// Check if all dates are within the current month (UTC)
			if (
				!isDateInCurrentMonth(data.orderDateRange.from) ||
				!isDateInCurrentMonth(data.orderDateRange.to) ||
				!isDateInCurrentMonth(data.dispatchDateRange.from) ||
				!isDateInCurrentMonth(data.dispatchDateRange.to)
			) {
				toast.error("All dates must be within the current month (UTC)");
				return;
			}

			if (editingId) {
				updateMutation.mutate({ id: editingId, ...formattedData });
				setEditingId(null);
			} else {
				createMutation.mutate(formattedData);
			}

			form.reset();
			toast.success(
				editingId
					? "Settings updated successfully"
					: "Settings created successfully",
			);
		} catch (error) {
			console.error(error);
			toast.error("An unexpected error occurred");
		}
	};

	const handleEdit = (setting: PostalOrderSettings) => {
		setEditingId(setting.id);

		form.reset({
			name: setting.name,
			orderDateRange: {
				from: fromUTCDateString(setting.orderStartDate),
				to: fromUTCDateString(setting.orderEndDate),
			},
			dispatchDateRange: {
				from: fromUTCDateString(setting.dispatchStartDate),
				to: fromUTCDateString(setting.dispatchEndDate),
			},
			isActive: setting.isActive,
		});
	};

	const handleDelete = async (id: number) => {
		const confirmed = await confirm({
			title: "Delete Postal Order Settings",
			description: "Are you sure you want to delete these settings?",
		});
		if (confirmed) {
			deleteMutation.mutate(id);
			toast.success("Settings deleted successfully");
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		form.reset();
	};

	return (
		<div className="container mx-auto py-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">
						Postal Order Settings
					</h1>
					<p className="text-muted-foreground">
						Configure multiple order placement and dispatch periods for{" "}
						{format(new Date(), "MMMM yyyy")}. You can create multiple slots
						with different date ranges. All dates are in UTC.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Plus className="h-5 w-5" />
								{editingId
									? "Edit Postal Order Slot"
									: "Create New Postal Order Slot"}
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								For {format(new Date(), "MMMM yyyy")}
							</p>
						</CardHeader>
						<CardContent>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-6"
								>
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Slot Name</FormLabel>
												<FormControl>
													<Input
														placeholder="e.g., Early Month, Mid Month, Holiday Special"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													A descriptive name for this order slot
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="orderDateRange"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Order Period</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																className={`w-full justify-start text-left font-normal ${
																	!field.value?.from && "text-muted-foreground"
																}`}
															>
																<CalendarIcon className="mr-2 h-4 w-4" />
																{field.value?.from ? (
																	field.value.to ? (
																		<>
																			{format(field.value.from, "LLL dd, y")} -{" "}
																			{format(field.value.to, "LLL dd, y")}
																		</>
																	) : (
																		format(field.value.from, "LLL dd, y")
																	)
																) : (
																	"Pick a date range"
																)}
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="range"
															defaultMonth={field.value?.from}
															selected={field.value}
															onSelect={field.onChange}
															disabled={isOrderDateDisabled}
															numberOfMonths={1}
															autoFocus
														/>
													</PopoverContent>
												</Popover>
												<FormDescription>
													Select the date range when customers can place orders
													(UTC). Dates selected for dispatch period will be
													disabled.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="dispatchDateRange"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Dispatch Period</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																className={`w-full justify-start text-left font-normal ${
																	!field.value?.from && "text-muted-foreground"
																}`}
															>
																<CalendarIcon className="mr-2 h-4 w-4" />
																{field.value?.from ? (
																	field.value.to ? (
																		<>
																			{format(field.value.from, "LLL dd, y")} -{" "}
																			{format(field.value.to, "LLL dd, y")}
																		</>
																	) : (
																		format(field.value.from, "LLL dd, y")
																	)
																) : (
																	"Pick a date range"
																)}
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="range"
															defaultMonth={field.value?.from}
															selected={field.value}
															onSelect={field.onChange}
															disabled={isDispatchDateDisabled}
															numberOfMonths={1}
															autoFocus
														/>
													</PopoverContent>
												</Popover>
												<FormDescription>
													Select the date range when orders will be dispatched
													(UTC). Dates selected for order period will be
													disabled.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="isActive"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0">
												<FormControl>
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Active</FormLabel>
													<FormDescription>
														Enable this postal order slot
													</FormDescription>
												</div>
											</FormItem>
										)}
									/>

									<div className="flex gap-3">
										<Button
											type="submit"
											disabled={
												createMutation.isPending || updateMutation.isPending
											}
											className="flex-1"
										>
											{createMutation.isPending || updateMutation.isPending
												? editingId
													? "Updating..."
													: "Creating..."
												: editingId
													? "Update Settings"
													: "Create Settings"}
										</Button>
										{editingId && (
											<Button
												type="button"
												variant="outline"
												onClick={handleCancel}
											>
												Cancel
											</Button>
										)}
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{format(new Date(), "MMMM yyyy")} Settings</CardTitle>
						</CardHeader>
						<CardContent>
							{currentMonthSettings.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">
									No postal order settings configured for this month yet.
								</p>
							) : (
								<div className="space-y-3">
									{currentMonthSettings.map((setting) => (
										<div
											key={setting.id}
											className="border rounded-lg p-4 space-y-2"
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<h4 className="font-medium">{setting.name}</h4>
													{!setting.isActive && (
														<span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
															Inactive
														</span>
													)}
												</div>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleEdit(setting)}
														disabled={updateMutation.isPending}
													>
														<Pencil className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDelete(setting.id)}
														disabled={deleteMutation.isPending}
														className="text-red-600 hover:text-red-700"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
											<div className="text-sm text-gray-600 space-y-1">
												<div>
													<strong>Order Period:</strong>{" "}
													{format(new Date(setting.orderStartDate), "MMM d")} -{" "}
													{format(new Date(setting.orderEndDate), "MMM d")}
												</div>
												<div>
													<strong>Dispatch Period:</strong>{" "}
													{format(new Date(setting.dispatchStartDate), "MMM d")}{" "}
													- {format(new Date(setting.dispatchEndDate), "MMM d")}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
