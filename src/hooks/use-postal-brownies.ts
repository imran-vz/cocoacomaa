import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type PostalComboItem = {
	id: number;
	name: string;
	description: string;
	price: string;
	imageUrl: string | null;
	createdAt: Date;
	items: string[];
	status: "available" | "unavailable";
	containsEgg: boolean;
};

const fetchPostalBrownies = async (): Promise<PostalComboItem[]> => {
	const response = await fetch("/api/admin/postal-brownies");
	if (!response.ok) {
		throw new Error("Failed to fetch postal brownies");
	}
	const data = await response.json();
	return data.postalCombos || [];
};

const deletePostalBrownie = async (id: number): Promise<void> => {
	const response = await fetch(`/api/postal-combos/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Failed to delete postal combo");
	}

	const data = await response.json();
	if (!data.success) {
		throw new Error(data.error || "Failed to delete postal combo");
	}
};

export const usePostalBrownies = (initialData?: PostalComboItem[]) => {
	return useQuery({
		queryKey: ["admin-postal-brownies"],
		queryFn: fetchPostalBrownies,
		initialData,
		staleTime: 30 * 1000, // 30 seconds
	});
};

export const useDeletePostalBrownie = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deletePostalBrownie,
		onSuccess: (_, deletedId) => {
			queryClient.setQueryData(
				["admin-postal-brownies"],
				(old: PostalComboItem[] = []) =>
					old.filter((combo) => combo.id !== deletedId),
			);
			toast.success("Postal combo deleted successfully");
		},
		onError: (error) => {
			console.error("Error deleting postal combo:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to delete postal combo",
			);
		},
	});
};
