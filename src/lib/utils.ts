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
