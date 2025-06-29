export interface Address {
	id: number;
	userId: string;
	addressLine1: string;
	addressLine2?: string | null;
	city: string;
	state: string;
	zip: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateAddressRequest {
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state: string;
	zip: string;
}

export interface AddressesResponse {
	success: boolean;
	addresses: Address[];
}

export interface CreateAddressResponse {
	success: boolean;
	address: Address;
}
