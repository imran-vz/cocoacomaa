import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CustomerContact } from "@/lib/db/schema";

type CustomerContactWithAddress = CustomerContact & {
	address: {
		id: number;
		addressLine1: string;
		addressLine2: string | null;
		city: string;
		state: string;
		zip: string;
	};
};

// GET: Fetch customer contacts
export function useCustomerContacts() {
	return useQuery<{ contacts: CustomerContactWithAddress[] }>({
		queryKey: ["customer-contacts"],
		queryFn: async () => {
			const response = await fetch("/api/customer-contacts");
			if (!response.ok) {
				throw new Error("Failed to fetch contacts");
			}
			return response.json();
		},
	});
}

// POST: Create customer contact
export function useCreateCustomerContact() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			name: string;
			phone: string;
			addressLine1: string;
			addressLine2?: string;
			city: string;
			state: string;
			zip: string;
		}) => {
			const response = await fetch("/api/customer-contacts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create contact");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["customer-contacts"] });
		},
	});
}

// PUT: Update customer contact
export function useUpdateCustomerContact() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: {
				name: string;
				phone: string;
				addressLine1: string;
				addressLine2?: string;
				city: string;
				state: string;
				zip: string;
			};
		}) => {
			const response = await fetch(`/api/customer-contacts/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update contact");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["customer-contacts"] });
		},
	});
}

// DELETE: Delete customer contact
export function useDeleteCustomerContact() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/customer-contacts/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete contact");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["customer-contacts"] });
		},
	});
}
