"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSpecialsSettings } from "@/hooks/use-specials-settings";

export default function SpecialsSettingsPage() {
	const { settings, isLoading, updateSettings, isUpdating } =
		useSpecialsSettings();
	const [isActive, setIsActive] = useState(false);
	const [pickupDateRange, setPickupDateRange] = useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({ from: undefined, to: undefined });
	const [pickupStartTime, setPickupStartTime] = useState("10:00");
	const [pickupEndTime, setPickupEndTime] = useState("18:00");
	const [description, setDescription] = useState("");

	const activeId = useId();
	const dateRangeId = useId();
	const startTimeId = useId();
	const endTimeId = useId();
	const descriptionId = useId();

	// Update local state when data is loaded
	useEffect(() => {
		if (settings) {
			setIsActive(settings.isActive);
			setPickupDateRange({
				from: settings.pickupStartDate
					? new Date(settings.pickupStartDate)
					: undefined,
				to: settings.pickupEndDate
					? new Date(settings.pickupEndDate)
					: undefined,
			});
			setPickupStartTime(settings.pickupStartTime);
			setPickupEndTime(settings.pickupEndTime);
			setDescription(settings.description || "");
		}
	}, [settings]);

	const handleSave = () => {
		if (!settings || !pickupDateRange.from || !pickupDateRange.to) return;

		updateSettings({
			isActive,
			pickupStartDate: pickupDateRange.from.toISOString().split("T")[0],
			pickupEndDate: pickupDateRange.to.toISOString().split("T")[0],
			pickupStartTime,
			pickupEndTime,
			description,
			id: settings.id,
		});
	};

	const isFormValid =
		pickupDateRange.from &&
		pickupDateRange.to &&
		pickupStartTime &&
		pickupEndTime;

	if (isLoading) {
		return (
			<div className="container mx-auto p-4 sm:p-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
					<div className="space-y-4">
						<div className="h-32 bg-gray-200 rounded"></div>
						<div className="h-32 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Specials Settings</h1>
				<p className="text-muted-foreground">
					Manage specials availability and pickup schedule
				</p>
			</div>

			<div className="max-w-2xl space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Specials Configuration</CardTitle>
						<CardDescription>
							Configure specials availability and pickup details for customers
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor={activeId}>Enable Specials</Label>
								<p className="text-sm text-muted-foreground">
									Toggle specials availability for customers
								</p>
							</div>
							<Switch
								id={activeId}
								checked={isActive}
								onChange={(e) => setIsActive(e.target.checked)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={dateRangeId}>Pickup Date Range</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										id={dateRangeId}
										variant="outline"
										className={`w-full justify-start text-left font-normal ${
											!pickupDateRange.from && "text-muted-foreground"
										}`}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{pickupDateRange.from ? (
											pickupDateRange.to ? (
												<>
													{format(pickupDateRange.from, "LLL dd, y")} -{" "}
													{format(pickupDateRange.to, "LLL dd, y")}
												</>
											) : (
												format(pickupDateRange.from, "LLL dd, y")
											)
										) : (
											"Pick a date range"
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="range"
										defaultMonth={pickupDateRange.from}
										selected={pickupDateRange}
										onSelect={(range) =>
											setPickupDateRange({
												from: range?.from ?? undefined,
												to: range?.to ?? undefined,
											})
										}
										disabled={(date) =>
											date < new Date(new Date().setHours(0, 0, 0, 0))
										}
										numberOfMonths={1}
										autoFocus
									/>
								</PopoverContent>
							</Popover>
							<p className="text-sm text-muted-foreground">
								Set the date range when customers can pickup their specials
								orders
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor={startTimeId}>Pickup Start Time</Label>
								<Input
									id={startTimeId}
									type="time"
									value={pickupStartTime}
									onChange={(e) => setPickupStartTime(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={endTimeId}>Pickup End Time</Label>
								<Input
									id={endTimeId}
									type="time"
									value={pickupEndTime}
									onChange={(e) => setPickupEndTime(e.target.value)}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor={descriptionId}>Description (Optional)</Label>
							<Textarea
								id={descriptionId}
								placeholder="Add any special instructions or notes for customers"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={3}
							/>
						</div>

						<Button
							onClick={handleSave}
							disabled={isUpdating || !isFormValid}
							className="w-full"
						>
							{isUpdating ? "Saving..." : "Save Settings"}
						</Button>
					</CardContent>
				</Card>

				{settings && (
					<Card>
						<CardHeader>
							<CardTitle>Current Configuration</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Status:</span>
								<span className={isActive ? "text-green-600" : "text-red-600"}>
									{isActive ? "Active" : "Inactive"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									Pickup Date Range:
								</span>
								<span>
									{pickupDateRange.from && pickupDateRange.to
										? `${format(pickupDateRange.from, "MMM d")} - ${format(
												pickupDateRange.to,
												"MMM d",
											)}`
										: "Not set"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Pickup Time:</span>
								<span>
									{pickupStartTime} - {pickupEndTime}
								</span>
							</div>
							{description && (
								<div className="pt-2">
									<span className="text-muted-foreground">Description:</span>
									<p className="mt-1 text-sm">{description}</p>
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
