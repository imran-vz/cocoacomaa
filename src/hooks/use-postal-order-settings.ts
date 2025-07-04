import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function usePostalOrderSettings(month: string) {
	const queryClient = useQueryClient();

	// Fetch settings
	const { data, isLoading, error } = useQuery({
		queryKey: ["postal-order-settings", month],
		queryFn: async () => {
			const url = `/api/postal-order-settings?month=${month}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("Failed to fetch postal order settings");
			}
			const data = await response.json();
			return data.settings as PostalOrderSettings[];
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Check if postal orders are allowed today
	const arePostalOrdersAllowed = () => {
		if (!month) return false;

		const settings = data;
		if (!settings) return false;

		const today = new Date().toISOString().split("T")[0];

		const settingsArray = Array.isArray(settings) ? settings : [settings];

		return settingsArray.some(
			(setting) =>
				setting.isActive &&
				today >= setting.orderStartDate &&
				today <= setting.orderEndDate,
		);
	};

	// Check if dispatching is active today
	const isDispatchingActive = () => {
		if (!month) return false;

		const settings = data;
		if (!settings) return false;

		const today = new Date().toISOString().split("T")[0];

		const settingsArray = Array.isArray(settings) ? settings : [settings];

		return settingsArray.some(
			(setting) =>
				setting.isActive &&
				today >= setting.dispatchStartDate &&
				today <= setting.dispatchEndDate,
		);
	};

	// Get the earliest available slot date for the current month
	const getEarliestAvailableSlot = () => {
		if (!data || !Array.isArray(data)) return null;

		const today = new Date().toISOString().split("T")[0];

		// Find future slots (order start date is after today)
		const futureSlots = data
			.filter((setting) => setting.isActive && setting.orderStartDate > today)
			.sort((a, b) => a.orderStartDate.localeCompare(b.orderStartDate));

		return futureSlots.length > 0 ? futureSlots[0] : null;
	};

	// Get the current active slot (if orders are currently allowed)
	const getCurrentActiveSlot = () => {
		if (!data || !Array.isArray(data)) return null;

		const today = new Date().toISOString().split("T")[0];

		return (
			data.find(
				(setting) =>
					setting.isActive &&
					today >= setting.orderStartDate &&
					today <= setting.orderEndDate,
			) || null
		);
	};

	// Create settings mutation
	const createMutation = useMutation({
		mutationFn: async (
			newSettings: Omit<PostalOrderSettings, "id" | "createdAt" | "updatedAt">,
		) => {
			const response = await fetch("/api/postal-order-settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newSettings),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to create settings");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["postal-order-settings"] });
		},
	});

	// Update settings mutation
	const updateMutation = useMutation({
		mutationFn: async ({
			id,
			...updateData
		}: Partial<PostalOrderSettings> & { id: number }) => {
			const response = await fetch("/api/postal-order-settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, ...updateData }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update settings");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["postal-order-settings"] });
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["postal-order-settings"] });
		},
	});

	return {
		settings: data,
		isLoading,
		error,
		arePostalOrdersAllowed: arePostalOrdersAllowed(),
		isDispatchingActive: isDispatchingActive(),
		getEarliestAvailableSlot,
		getCurrentActiveSlot,
		createSettings: createMutation.mutate,
		updateSettings: updateMutation.mutate,
		deleteSettings: deleteMutation.mutate,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
}
