import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type WorkshopWithSlotData = {
	id: number;
	title: string;
	description: string;
	imageUrl: string | null;
	amount: string;
	type: "online" | "offline";
	maxBookings: number;
	status: "active" | "inactive";
	createdAt: Date;
	currentSlotsUsed: number;
	currentBookings: number;
	availableSlots: number;
};

const fetchWorkshops = async (): Promise<WorkshopWithSlotData[]> => {
	const response = await fetch("/api/admin/workshops");
	if (!response.ok) {
		throw new Error("Failed to fetch workshops");
	}
	const data = await response.json();
	return data.workshops || [];
};

const deleteWorkshop = async (id: number): Promise<void> => {
	const response = await fetch(`/api/workshops/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Failed to delete workshop");
	}
};

export const useWorkshops = (initialData?: WorkshopWithSlotData[]) => {
	return useQuery({
		queryKey: ["admin-workshops"],
		queryFn: fetchWorkshops,
		initialData,
		staleTime: 30 * 1000, // 30 seconds
	});
};

export const useDeleteWorkshop = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteWorkshop,
		onSuccess: (_, deletedId) => {
			queryClient.setQueryData(
				["admin-workshops"],
				(old: WorkshopWithSlotData[] = []) =>
					old.filter((workshop) => workshop.id !== deletedId),
			);
			toast.success("Workshop deleted successfully");
		},
		onError: (error) => {
			console.error("Error deleting workshop:", error);
			toast.error("Failed to delete workshop");
		},
	});
};
