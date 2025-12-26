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
	status: "active" | "inactive" | "completed";
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

const completeWorkshop = async (id: number): Promise<void> => {
	const response = await fetch(`/api/admin/workshops/${id}/complete`, {
		method: "PATCH",
	});

	if (!response.ok) {
		throw new Error("Failed to mark workshop as completed");
	}
};

const duplicateWorkshop = async (id: number): Promise<WorkshopWithSlotData> => {
	const response = await fetch(`/api/workshops/${id}/duplicate`, {
		method: "POST",
	});

	if (!response.ok) {
		throw new Error("Failed to duplicate workshop");
	}

	const data = await response.json();
	return data.data;
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

export const useCompleteWorkshop = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: completeWorkshop,
		onSuccess: (_, completedId) => {
			queryClient.setQueryData(
				["admin-workshops"],
				(old: WorkshopWithSlotData[] = []) =>
					old.map((workshop) =>
						workshop.id === completedId
							? { ...workshop, status: "completed" }
							: workshop,
					),
			);
			toast.success("Workshop marked as completed");
		},
		onError: (error) => {
			console.error("Error marking workshop as completed:", error);
			toast.error("Failed to mark workshop as completed");
		},
	});
};

export const useDuplicateWorkshop = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: duplicateWorkshop,
		onSuccess: (newWorkshop) => {
			queryClient.setQueryData(
				["admin-workshops"],
				(old: WorkshopWithSlotData[] = []) => [newWorkshop, ...old],
			);
			toast.success("Workshop duplicated successfully");
		},
		onError: (error) => {
			console.error("Error duplicating workshop:", error);
			toast.error("Failed to duplicate workshop");
		},
	});
};
