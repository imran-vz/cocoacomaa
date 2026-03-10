"use client";

import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
import { formatLocalDate } from "@/lib/format-timestamp";

// ─── Constants ──────────────────────────────────────────────────

/** Available pickup time slots from 12pm to 6pm */
export const TIME_SLOTS = [
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
];

// ─── Date helpers ───────────────────────────────────────────────

/** Calculate date constraints based on lead time */
export function getDateConstraints(leadTimeDays = 3) {
	const today = new Date();
	const minDate = new Date(today);
	minDate.setDate(today.getDate() + leadTimeDays);

	const maxDate = new Date(today);
	maxDate.setDate(today.getDate() + 33);

	return { minDate, maxDate };
}

/** Check if date is disabled (Monday, Tuesday, or outside range) */
export function isDateDisabled(date: Date, leadTimeDays = 3) {
	const { minDate, maxDate } = getDateConstraints(leadTimeDays);
	const dayOfWeek = date.getDay();

	if (date < minDate || date > maxDate) {
		return true;
	}

	// Disable Monday (1) and Tuesday (2)
	return dayOfWeek === 1 || dayOfWeek === 2;
}

// ─── Types ──────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: TanStack Form field API
type FieldApi = any;

interface SpecialsSettings {
	pickupStartDate: string;
	pickupEndDate: string;
	pickupStartTime: string;
	pickupEndTime: string;
}

interface PickupSchedulerProps {
	/** The TanStack form instance */
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form field API
	form: any;
	/** Whether cart contains specials */
	hasSpecials: boolean;
	/** Settings for specials (pickup date window, etc.) */
	specialsSettings?: SpecialsSettings | null;
	/** Maximum lead time from cart items (days) */
	maxLeadTime: number;
	/** Currently selected pickup date */
	pickupDate?: Date;
	/** Currently selected pickup time */
	pickupTime?: string;
}

/**
 * Pickup date+time selector for the checkout form.
 * Handles two modes:
 *  1. Specials — date picker within a fixed pickup window, no time selection
 *  2. Regular cakes — date picker with lead time + Mon/Tue exclusions, plus time slot selector
 */
export function PickupScheduler({
	form,
	hasSpecials,
	specialsSettings,
	maxLeadTime,
	pickupDate,
	pickupTime,
}: PickupSchedulerProps) {
	// Specials mode
	if (hasSpecials && specialsSettings) {
		return (
			<div className="space-y-3 sm:space-y-4 lg:space-y-6">
				<div className="border-t pt-3 sm:pt-4 lg:pt-6">
					<h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
						<CalendarIcon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0" />
						<span>Pickup Date Selection</span>
					</h3>
					<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
						Select your preferred pickup date from the available range. Pickup
						time: {specialsSettings.pickupStartTime} -{" "}
						{specialsSettings.pickupEndTime}
					</p>
				</div>
				<div className="space-y-3 sm:space-y-4 lg:space-y-6">
					<form.Field
						name="pickupDate"
						// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
						children={(field: FieldApi) => {
							const hasErrors =
								field.state.meta.errors && field.state.meta.errors.length > 0;
							return (
								<Field data-invalid={hasErrors} className="flex flex-col">
									<FieldLabel className="text-sm sm:text-base font-medium">
										Pickup Date (Available:{" "}
										{formatLocalDate(
											new Date(specialsSettings.pickupStartDate),
										)}{" "}
										to{" "}
										{formatLocalDate(new Date(specialsSettings.pickupEndDate))})
									</FieldLabel>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={`w-full h-10 sm:h-11 px-3 py-2 text-left font-normal text-sm sm:text-base justify-between ${
													!field.state.value && "text-muted-foreground"
												}`}
											>
												<span className="truncate">
													{field.state.value
														? formatLocalDate(field.state.value)
														: "Select a pickup date"}
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
												selected={field.state.value}
												onSelect={field.handleChange}
												disabled={(date) => {
													const startDate = new Date(
														specialsSettings.pickupStartDate,
													);
													const endDate = new Date(
														specialsSettings.pickupEndDate,
													);
													startDate.setHours(0, 0, 0, 0);
													endDate.setHours(23, 59, 59, 999);
													const compareDate = new Date(date);
													compareDate.setHours(12, 0, 0, 0);
													return (
														compareDate < startDate || compareDate > endDate
													);
												}}
												initialFocus
												className="rounded-md border-0"
											/>
										</PopoverContent>
									</Popover>
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
			</div>
		);
	}

	// Regular cake mode
	return (
		<div className="space-y-3 sm:space-y-4 lg:space-y-6">
			<div className="border-t pt-3 sm:pt-4 lg:pt-6">
				<h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
					<CalendarIcon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0" />
					<span>Pickup Schedule</span>
				</h3>
				<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
					Select your preferred pickup date and time. Available Wednesday to
					Sunday, 12PM to 6PM. Minimum {maxLeadTime} day
					{maxLeadTime > 1 ? "s" : ""} advance booking required based on your
					cart items.
				</p>
			</div>

			<div className="space-y-3 sm:space-y-4 lg:space-y-6">
				{/* Date Picker */}
				<form.Field
					name="pickupDate"
					// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
					children={(field: FieldApi) => {
						const hasErrors =
							field.state.meta.errors && field.state.meta.errors.length > 0;
						return (
							<Field data-invalid={hasErrors} className="flex flex-col">
								<FieldLabel className="text-sm sm:text-base font-medium">
									Pickup Date
								</FieldLabel>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={`w-full h-10 sm:h-11 px-3 py-2 text-left font-normal text-sm sm:text-base justify-between ${
												!field.state.value && "text-muted-foreground"
											}`}
										>
											<span className="truncate">
												{field.state.value
													? formatLocalDate(field.state.value)
													: "Pick a date"}
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
											selected={field.state.value}
											onSelect={field.handleChange}
											disabled={(date) => isDateDisabled(date, maxLeadTime)}
											initialFocus
											className="rounded-md border-0"
										/>
									</PopoverContent>
								</Popover>
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

				{/* Time Picker */}
				<form.Field
					name="pickupTime"
					// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
					children={(field: FieldApi) => {
						const hasErrors =
							field.state.meta.errors && field.state.meta.errors.length > 0;
						return (
							<Field data-invalid={hasErrors}>
								<FieldLabel className="text-sm sm:text-base font-medium">
									Pickup Time
								</FieldLabel>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value}
								>
									<SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base">
										<SelectValue placeholder="Select time" />
									</SelectTrigger>
									<SelectContent className="max-h-50 sm:max-h-75">
										{TIME_SLOTS.map((slot) => (
											<SelectItem
												key={slot.value}
												value={slot.value}
												className="text-sm sm:text-base"
											>
												{slot.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
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

			{/* Quick Summary for Mobile */}
			{(pickupDate || pickupTime) && (
				<div className="bg-muted/50 rounded-lg p-3 sm:p-4 lg:hidden">
					<div className="flex items-center gap-2 mb-2">
						<Clock className="h-4 w-4 text-muted-foreground shrink-0" />
						<span className="text-sm font-medium">Selected Pickup</span>
					</div>
					<div className="space-y-1">
						{pickupDate && (
							<p className="text-xs text-muted-foreground">
								📅 {format(pickupDate, "EEEE, MMM d, yyyy")}
							</p>
						)}
						{pickupTime && (
							<p className="text-xs text-muted-foreground">
								🕐 {TIME_SLOTS.find((t) => t.value === pickupTime)?.label}
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
