import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
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

type PickupScheduleSectionProps = {
	// biome-ignore lint/suspicious/noExplicitAny: we need to use any here because the form is dynamically generated
	form: UseFormReturn<any>;
	maxLeadTime: number;
	isDateDisabled: (date: Date, leadTimeDays: number) => boolean;
	timeSlots: Array<{ value: string; label: string }>;
	hasSpecials?: boolean;
	specialsSettings?: {
		pickupStartDate: string;
		pickupEndDate: string;
		pickupStartTime: string;
		pickupEndTime: string;
	} | null;
};

export function PickupScheduleSection({
	form,
	maxLeadTime,
	isDateDisabled,
	timeSlots,
	hasSpecials = false,
	specialsSettings,
}: PickupScheduleSectionProps) {
	// For specials orders
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
					<FormField
						control={form.control}
						name="pickupDate"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel className="text-sm sm:text-base font-medium">
									Pickup Date (Available:{" "}
									{formatLocalDate(new Date(specialsSettings.pickupStartDate))}{" "}
									to {formatLocalDate(new Date(specialsSettings.pickupEndDate))}
									)
								</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												className={`w-full h-10 sm:h-11 px-3 py-2 text-left font-normal text-sm sm:text-base justify-between ${
													!field.value && "text-muted-foreground"
												}`}
											>
												<span className="truncate">
													{field.value
														? formatLocalDate(field.value)
														: "Select a pickup date"}
												</span>
												<CalendarIcon className="h-4 w-4 opacity-50 shrink-0 ml-2" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0 z-50"
										align="start"
										side="bottom"
										sideOffset={4}
									>
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
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
												return compareDate < startDate || compareDate > endDate;
											}}
											initialFocus
											className="rounded-md border-0"
										/>
									</PopoverContent>
								</Popover>
								<FormMessage className="text-xs sm:text-sm" />
							</FormItem>
						)}
					/>
				</div>
			</div>
		);
	}

	// For regular cake orders
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
				<FormField
					control={form.control}
					name="pickupDate"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel className="text-sm sm:text-base font-medium">
								Pickup Date
							</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant="outline"
											className={`w-full h-10 sm:h-11 px-3 py-2 text-left font-normal text-sm sm:text-base justify-between ${
												!field.value && "text-muted-foreground"
											}`}
										>
											<span className="truncate">
												{field.value
													? formatLocalDate(field.value)
													: "Pick a date"}
											</span>
											<CalendarIcon className="h-4 w-4 opacity-50 shrink-0 ml-2" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0 z-50"
									align="start"
									side="bottom"
									sideOffset={4}
								>
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) => isDateDisabled(date, maxLeadTime)}
										initialFocus
										className="rounded-md border-0"
									/>
								</PopoverContent>
							</Popover>
							<FormMessage className="text-xs sm:text-sm" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="pickupTime"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm sm:text-base font-medium">
								Pickup Time
							</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base">
										<SelectValue placeholder="Select time" />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="max-h-[200px] sm:max-h-[300px]">
									{timeSlots.map((slot) => (
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
							<FormMessage className="text-xs sm:text-sm" />
						</FormItem>
					)}
				/>
			</div>

			{/* Quick Summary for Mobile */}
			{(form.watch("pickupDate") || form.watch("pickupTime")) && (
				<div className="bg-muted/50 rounded-lg p-3 sm:p-4 lg:hidden">
					<div className="flex items-center gap-2 mb-2">
						<Clock className="h-4 w-4 text-muted-foreground shrink-0" />
						<span className="text-sm font-medium">Selected Pickup</span>
					</div>
					<div className="space-y-1">
						{form.watch("pickupDate") && (
							<p className="text-xs text-muted-foreground">
								📅{" "}
								{format(form.watch("pickupDate") as Date, "EEEE, MMM d, yyyy")}
							</p>
						)}
						{form.watch("pickupTime") && (
							<p className="text-xs text-muted-foreground">
								🕐{" "}
								{
									timeSlots.find((t) => t.value === form.watch("pickupTime"))
										?.label
								}
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
