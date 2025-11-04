import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type DessertItem = {
	id: number;
	name: string;
	price: string;
	imageUrl: string | null;
	category: "cake" | "dessert" | "special";
	leadTimeDays: number;
	status: "available" | "unavailable";
	createdAt: Date;
	containsEgg: boolean;
};

const fetchDesserts = async (): Promise<DessertItem[]> => {
	const response = await fetch("/api/admin/desserts");
	if (!response.ok) {
		throw new Error("Failed to fetch desserts");
	}
	const data = await response.json();
	return data.desserts || [];
};

const deleteDessert = async (id: number): Promise<void> => {
	const response = await fetch(`/api/desserts/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Failed to delete dessert");
	}
};

export const useDesserts = (initialData?: DessertItem[]) => {
	return useQuery({
		queryKey: ["admin-desserts"],
		queryFn: fetchDesserts,
		initialData,
		staleTime: 30 * 1000, // 30 seconds
	});
};

export const useDeleteDessert = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteDessert,
		onSuccess: (_, deletedId) => {
			queryClient.setQueryData(["admin-desserts"], (old: DessertItem[] = []) =>
				old.filter((dessert) => dessert.id !== deletedId),
			);
			toast.success("Dessert deleted successfully");
		},
		onError: (error) => {
			console.error("Error deleting dessert:", error);
			toast.error("Failed to delete dessert");
		},
	});
};
