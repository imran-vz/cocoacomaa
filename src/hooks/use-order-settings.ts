import { useQuery } from "@tanstack/react-query";

interface OrderSettings {
	id: number;
	allowedDays: number[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export function useOrderSettings() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["order-settings"],
		queryFn: async () => {
			const response = await fetch("/api/order-settings");
			if (!response.ok) {
				throw new Error("Failed to fetch order settings");
			}
			const data = await response.json();
			return data.settings as OrderSettings;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
	});

	// Check if orders are allowed today
	const areOrdersAllowed = () => {
		if (!data) {
			// Fallback to default Monday/Tuesday
			const now = new Date();
			const dayOfWeek = now.getDay();
			return dayOfWeek === 1 || dayOfWeek === 2;
		}

		if (!data.isActive) {
			return false;
		}

		const now = new Date();
		const dayOfWeek = now.getDay();
		return data.allowedDays.includes(dayOfWeek);
	};

	// Get next order day
	const getNextOrderDay = () => {
		const allowedDays = data?.allowedDays || [1, 2]; // Default to Monday/Tuesday
		const now = new Date();
		const dayOfWeek = now.getDay();

		// If today is allowed
		if (allowedDays.includes(dayOfWeek)) {
			return "now";
		}

		// Find next allowed day
		const dayNames = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];

		// Check days ahead this week
		for (let i = 1; i <= 7; i++) {
			const checkDay = (dayOfWeek + i) % 7;
			if (allowedDays.includes(checkDay)) {
				if (i === 1) {
					return `tomorrow (${dayNames[checkDay]})`;
				} else if (i <= 6) {
					return `this ${dayNames[checkDay]}`;
				} else {
					return `next ${dayNames[checkDay]}`;
				}
			}
		}

		// Fallback
		return "check back later";
	};

	return {
		settings: data,
		isLoading,
		error,
		areOrdersAllowed: areOrdersAllowed(),
		getNextOrderDay: getNextOrderDay(),
	};
}
