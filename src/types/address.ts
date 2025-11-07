import type { Address } from "@/lib/db/schema";

export type CreateAddressRequest = Pick<
	Address,
	"addressLine1" | "addressLine2" | "city" | "state" | "zip"
>;

export interface AddressesResponse {
	success: boolean;
	addresses: Address[];
}

export interface CreateAddressResponse {
	success: boolean;
	address: Address;
}
