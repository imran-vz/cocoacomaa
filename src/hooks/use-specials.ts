import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type SpecialItem = {
	id: number;
	name: string;
	price: string;
	imageUrl: string | null;
	status: "available" | "unavailable";
	createdAt: Date;
	containsEgg: boolean;
};

const fetchSpecials = async (): Promise<SpecialItem[]> => {
	const response = await fetch("/api/admin/specials");
	if (!response.ok) {
		throw new Error("Failed to fetch specials");
	}
	const data = await response.json();
	return data.specials || [];
};

const deleteSpecial = async (id: number): Promise<void> => {
	const response = await fetch(`/api/desserts/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Failed to delete special");
	}
};

export const useSpecials = (initialData?: SpecialItem[]) => {
	return useQuery({
		queryKey: ["admin-specials"],
		queryFn: fetchSpecials,
		initialData,
		staleTime: 30 * 1000, // 30 seconds
	});
};

export const useDeleteSpecial = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteSpecial,
		onSuccess: (_, deletedId) => {
			queryClient.setQueryData(["admin-specials"], (old: SpecialItem[] = []) =>
				old.filter((special) => special.id !== deletedId),
			);
			toast.success("Special deleted successfully");
		},
		onError: (error) => {
			console.error("Error deleting special:", error);
			toast.error("Failed to delete special");
		},
	});
};
