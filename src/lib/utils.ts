import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
	return Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(amount);
}

export function formatDate(date: Date) {
	return new Date(date).toLocaleDateString("en-IN", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Check if orders are allowed based on the current day
 * Orders are only accepted on Mondays (1) and Tuesdays (2)
 * @returns boolean indicating if orders are allowed
 */
export function areOrdersAllowed(): boolean {
	const now = new Date();
	const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
	return dayOfWeek === 1 || dayOfWeek === 2; // Monday or Tuesday
}

/**
 * Get the next allowed order day
 * @returns string indicating when orders will be accepted next
 */
export function getNextOrderDay(): string {
	const now = new Date();
	const dayOfWeek = now.getDay();

	if (dayOfWeek === 0) {
		// Sunday
		return "tomorrow (Monday)";
	} else if (dayOfWeek === 1 || dayOfWeek === 2) {
		// Monday or Tuesday
		return "now";
	} else if (dayOfWeek === 3) {
		// Wednesday
		return "next Monday";
	} else if (dayOfWeek === 4) {
		// Thursday
		return "next Monday";
	} else if (dayOfWeek === 5) {
		// Friday
		return "next Monday";
	} else {
		// Saturday
		return "next Monday";
	}
}
