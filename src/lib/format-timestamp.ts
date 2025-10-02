import { TZDateMini } from "@date-fns/tz";
import { format } from "date-fns";

const TIMEZONE = "Asia/Kolkata";

/**
 * Format a date with time in the format: "December 25, 2024 at 3:30 PM"
 */
export function formatDateTime(date: Date | string): string {
	return format(new TZDateMini(date, TIMEZONE), "PPP 'at' p");
}

/**
 * Format a date with day name in the format: "Wednesday, December 25, 2024"
 */
export function formatDateWithDay(date: Date | string): string {
	return format(new TZDateMini(date, TIMEZONE), "EEEE, MMMM d, yyyy");
}

/**
 * Format time only in the format: "3:30 PM"
 */
export function formatTime(date: Date | string): string {
	return format(new TZDateMini(date, TIMEZONE), "h:mm a");
}

/**
 * Format date only in the format: "December 25, 2024"
 */
export function formatDate(date: Date | string): string {
	return format(new TZDateMini(date, TIMEZONE), "PPP");
}

/**
 * Format date in short format: "Dec 25, 2024"
 */
export function formatShortDate(date: Date | string): string {
	return format(new TZDateMini(date, TIMEZONE), "MMM d, yyyy");
}

/**
 * Format date with long month: "December 25, 2024"
 */
export function formatLongDate(date: Date | string): string {
	return format(new TZDateMini(date, TIMEZONE), "MMMM d, yyyy");
}

/**
 * Format month and year: "December 2024"
 */
export function formatMonthYear(date: Date | string): string {
	return format(new TZDateMini(date, TIMEZONE), "MMMM yyyy");
}

/**
 * Format date in ISO year-month format: "2024-12"
 */
export function formatYearMonth(date: Date | string): string {
	return format(new TZDateMini(date, TIMEZONE), "yyyy-MM");
}

/**
 * Format time only without timezone conversion (for local dates)
 */
export function formatLocalTime(date: Date): string {
	return format(date, "p");
}

/**
 * Format date only without timezone conversion (for local dates)
 */
export function formatLocalDate(date: Date): string {
	return format(date, "PPP");
}

/**
 * Format date in short format without timezone conversion (for local dates)
 */
export function formatLocalShortDate(date: Date): string {
	return format(date, "MMM d, yyyy");
}
