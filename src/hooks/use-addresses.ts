import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
	Address,
	AddressesResponse,
	CreateAddressRequest,
	CreateAddressResponse,
} from "@/types/address";

const fetchAddresses = async (): Promise<Address[]> => {
	const response = await fetch("/api/addresses");
	if (!response.ok) {
		throw new Error("Failed to fetch addresses");
	}
	const data: AddressesResponse = await response.json();
	return data.addresses || [];
};

const createAddress = async (
	addressData: CreateAddressRequest,
): Promise<Address> => {
	const response = await fetch("/api/addresses", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(addressData),
	});

	if (!response.ok) {
		throw new Error("Failed to create address");
	}

	const data: CreateAddressResponse = await response.json();
	return data.address;
};

const deleteAddress = async (addressId: number): Promise<void> => {
	const response = await fetch(`/api/addresses/${addressId}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Failed to delete address");
	}
};

export const useAddresses = () => {
	return useQuery({
		queryKey: ["addresses"],
		queryFn: fetchAddresses,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const useCreateAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createAddress,
		onSuccess: (newAddress) => {
			// Update the addresses cache
			queryClient.setQueryData(["addresses"], (old: Address[] = []) => [
				newAddress,
				...old,
			]);
			toast.success("Address saved successfully!");
		},
		onError: (error) => {
			console.error("Error creating address:", error);
			toast.error("Failed to save address");
		},
	});
};

export const useDeleteAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteAddress,
		onSuccess: (_, deletedId) => {
			// Remove the deleted address from cache
			queryClient.setQueryData(["addresses"], (old: Address[] = []) =>
				old.filter((address) => address.id !== deletedId),
			);
			toast.success("Address deleted successfully!");
		},
		onError: (error) => {
			console.error("Error deleting address:", error);
			toast.error("Failed to delete address");
		},
	});
};
