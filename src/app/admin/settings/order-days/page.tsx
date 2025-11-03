"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Save, Settings } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DAYS = [
	{ value: 0, label: "Sunday", short: "Sun" },
	{ value: 1, label: "Monday", short: "Mon" },
	{ value: 2, label: "Tuesday", short: "Tue" },
	{ value: 3, label: "Wednesday", short: "Wed" },
	{ value: 4, label: "Thursday", short: "Thu" },
	{ value: 5, label: "Friday", short: "Fri" },
	{ value: 6, label: "Saturday", short: "Sat" },
];

interface CakeOrderSettings {
	id: number;
	allowedDays: number[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export default function CakeOrderDaysSettingsPage() {
	const queryClient = useQueryClient();
	const [selectedDays, setSelectedDays] = useState<number[]>([]);
	const [isActive, setIsActive] = useState(true);
	const enableCakeOrderSystemId = useId();

	// Fetch current settings
	const { data: settingsData, isLoading } = useQuery({
		queryKey: ["cake-order-settings"],
		queryFn: async () => {
			const response = await fetch("/api/cake-order-settings");
			if (!response.ok) {
				throw new Error("Failed to fetch cake order settings");
			}
			const data = await response.json();
			return data.settings as CakeOrderSettings;
		},
	});

	// Update local state when data is loaded
	useEffect(() => {
		if (settingsData) {
			setSelectedDays(settingsData.allowedDays);
			setIsActive(settingsData.isActive);
		}
	}, [settingsData]);

	// Update settings mutation
	const updateSettingsMutation = useMutation({
		mutationFn: async ({
			allowedDays,
			isActive,
		}: {
			allowedDays: number[];
			isActive: boolean;
		}) => {
			const response = await fetch("/api/cake-order-settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ allowedDays, isActive, id: settingsData?.id }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update settings");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Cake order settings updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["cake-order-settings"] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const handleDayToggle = (dayValue: number) => {
		setSelectedDays((prev) => {
			if (prev.includes(dayValue)) {
				return prev.filter((day) => day !== dayValue);
			} else {
				return [...prev, dayValue].sort();
			}
		});
	};

	const handleSave = () => {
		if (isActive && selectedDays.length === 0) {
			toast.error("Please select at least one day");
			return;
		}

		updateSettingsMutation.mutate({
			allowedDays: selectedDays,
			isActive,
		});
	};

	const getCurrentDayStatus = () => {
		const today = new Date().getDay();
		const isToday = selectedDays.includes(today);
		const todayName = DAYS[today].label;

		return { isToday, todayName };
	};

	const { isToday, todayName } = getCurrentDayStatus();

	if (isLoading) {
		return (
			<FadeIn>
				<div className="container mx-auto py-6 px-4">
					<div className="max-w-6xl mx-auto">
						<div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6" />
						<Card>
							<CardHeader>
								<div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{DAYS.map((day) => (
										<div
											key={day.value}
											className="h-12 bg-gray-200 rounded animate-pulse"
										/>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</FadeIn>
		);
	}

	return (
		<FadeIn>
			<div className="container mx-auto py-6 px-4">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="flex items-center gap-3 mb-6">
						<Settings className="h-6 w-6" />
						<h1 className="text-2xl sm:text-3xl font-bold">
							Cake Order Days Settings
						</h1>
					</div>

					{/* Current Status Banner */}
					<Card
						className={`mb-6 ${isToday ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}
					>
						<CardContent className="py-4">
							<div className="flex items-center gap-3">
								<Calendar
									className={`h-5 w-5 ${isToday ? "text-green-600" : "text-orange-600"}`}
								/>
								<div>
									<p
										className={`font-medium ${isToday ? "text-green-900" : "text-orange-900"}`}
									>
										Today is {todayName}
									</p>
									<p
										className={`text-sm ${isToday ? "text-green-700" : "text-orange-700"}`}
									>
										{isActive
											? isToday
												? "Cake orders are currently being accepted"
												: "Cake orders are currently not being accepted"
											: "Cake order system is currently disabled"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Settings Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5" />
								Configure Order Days
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								Select the days of the week when customers can place orders.
							</p>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Enable/Disable Toggle */}
							<Label
								htmlFor={enableCakeOrderSystemId}
								className="flex items-center justify-between p-4 border rounded-lg"
							>
								<div>
									<p className="text-base font-medium">
										Enable Cake Order System
									</p>
									<p className="text-sm text-muted-foreground">
										Toggle to enable or disable the entire cake order system
									</p>
								</div>
								<Checkbox
									id={enableCakeOrderSystemId}
									checked={isActive}
									onCheckedChange={(checked) => setIsActive(checked === true)}
								/>
							</Label>

							{/* Days Selection */}
							<div className="space-y-4">
								<Label className="text-base font-medium">
									Allowed Days for Cake Orders
								</Label>
								{!isActive && (
									<p className="text-sm text-muted-foreground">
										Day selection is disabled while the cake order system is
										inactive.
									</p>
								)}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{DAYS.map((day) => (
										<div
											key={day.value}
											className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
												!isActive
													? "border-muted bg-muted/30 opacity-60"
													: selectedDays.includes(day.value)
														? "border-primary bg-primary/5"
														: "border-border"
											}`}
										>
											<Checkbox
												id={`day-${day.value}`}
												checked={selectedDays.includes(day.value)}
												onCheckedChange={() => handleDayToggle(day.value)}
												disabled={!isActive}
											/>
											<Label
												htmlFor={`day-${day.value}`}
												className={`flex-1 font-medium ${
													!isActive
														? "cursor-not-allowed text-muted-foreground"
														: "cursor-pointer"
												}`}
											>
												{day.label}
											</Label>
										</div>
									))}
								</div>

								{selectedDays.length === 0 && isActive && (
									<p className="text-sm text-red-600">
										Please select at least one day for cake orders.
									</p>
								)}
							</div>

							{/* Summary */}
							<div className="p-4 bg-muted/50 rounded-lg">
								<p className="text-sm font-medium mb-2">Summary:</p>
								{!isActive ? (
									<p className="text-sm text-muted-foreground">
										The cake order system is currently{" "}
										<span className="font-medium text-foreground">
											disabled
										</span>
										. Customers will not be able to place orders.
									</p>
								) : selectedDays.length > 0 ? (
									<p className="text-sm text-muted-foreground">
										Cake orders will be accepted on:{" "}
										<span className="font-medium text-foreground">
											{selectedDays.map((day) => DAYS[day].label).join(", ")}
										</span>
									</p>
								) : (
									<p className="text-sm text-red-600">
										No days selected. Please select at least one day for cake
										orders.
									</p>
								)}
							</div>

							{/* Save Button */}
							<div className="flex justify-end pt-4">
								<Button
									onClick={handleSave}
									disabled={
										(isActive && selectedDays.length === 0) ||
										updateSettingsMutation.isPending
									}
									size="lg"
								>
									{updateSettingsMutation.isPending ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
											Saving...
										</>
									) : (
										<>
											<Save className="h-4 w-4 mr-2" />
											Save Settings
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</FadeIn>
	);
}
