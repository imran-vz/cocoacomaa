import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { SpecialsSettings } from "@/lib/db/schema";

interface UpdateSpecialsSettingsData {
	isActive: boolean;
	pickupStartDate: string;
	pickupEndDate: string;
	pickupStartTime: string;
	pickupEndTime: string;
	description?: string;
	id: number;
}

export function useSpecialsSettings() {
	const queryClient = useQueryClient();

	const { data: settings, isLoading } = useQuery({
		queryKey: ["specials-settings"],
		queryFn: async () => {
			const response = await fetch("/api/specials-settings");
			if (!response.ok) {
				throw new Error("Failed to fetch specials settings");
			}
			const data = await response.json();
			return data.settings as SpecialsSettings;
		},
	});

	const updateSettingsMutation = useMutation({
		mutationFn: async (data: UpdateSpecialsSettingsData) => {
			const response = await fetch("/api/specials-settings", {
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
		onSuccess: () => {
			toast.success("Specials settings updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["specials-settings"] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	return {
		settings,
		isLoading,
		updateSettings: updateSettingsMutation.mutate,
		isUpdating: updateSettingsMutation.isPending,
	};
}
