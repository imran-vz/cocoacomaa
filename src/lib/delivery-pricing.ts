import { PINCODES } from "@/lib/bengaluru-pincodes";
import { config } from "@/lib/config";
import type { Address } from "./db/schema";

/**
 * Calculate delivery cost based on address location
 * @param address - The delivery address
 * @returns The delivery cost in rupees
 */
export function calculateDeliveryCost(
	address: Pick<Address, "city" | "zip">,
): number {
	// Check if the city is Bengaluru
	const city = address.city.toLowerCase().trim();
	const pincode = address.zip.trim();

	// Check for Bengaluru variations and pincodes
	const isBengaluru =
		city === "bengaluru" ||
		city === "bangalore" ||
		city === "bangaluru" ||
		pincode in PINCODES; // Check against comprehensive Bengaluru pincodes list

	if (isBengaluru) {
		return config.bengaluruPostalDeliveryCost; // Special rate for Bengaluru
	}

	return config.postalDeliveryCost; // Default rate (250)
}

/**
 * Check if an address qualifies for Bengaluru pricing
 * @param address - The delivery address
 * @returns True if address is in Bengaluru
 */
export function isBengaluruAddress(
	address: Pick<Address, "city" | "zip">,
): boolean {
	return calculateDeliveryCost(address) === config.bengaluruPostalDeliveryCost;
}
