import { TZDateMini } from "@date-fns/tz";
import { format } from "date-fns";

const TIMEZONE = "Asia/Kolkata";

const FORMAT_OPTIONS = {
	LONG: "PPP 'at' p",
	SHORT: "MMM d, yyyy",
	LONG_MONTH: "MMMM d, yyyy",
	LONG_WEEKDAY: "EEEE, MMMM d, yyyy",
	MONTH_YEAR: "MMMM yyyy",
	YEAR_MONTH: "yyyy-MM",
	TIME: "h:mm a",
	DATE: "PPP",
};

function _format(date: Date, fmt: string): string {
	return format(new TZDateMini(date, TIMEZONE), fmt);
}

/**
 * Format a date with time in the format: "December 25, 2024 at 3:30 PM"
 */
export function formatDateTime(date: Date | string): string {
	return _format(new Date(date), FORMAT_OPTIONS.LONG);
}

/**
 * Format a date with day name in the format: "Wednesday, December 25, 2024"
 */
export function formatDateWithDay(date: Date | string): string {
	return _format(new Date(date), FORMAT_OPTIONS.LONG_WEEKDAY);
}

/**
 * Format time only in the format: "3:30 PM"
 */
export function formatTime(date: Date | string): string {
	return _format(new Date(date), FORMAT_OPTIONS.TIME);
}

/**
 * Format date only in the format: "December 25, 2024"
 */
export function formatDate(date: Date | string): string {
	return _format(new Date(date), FORMAT_OPTIONS.DATE);
}

/**
 * Format date in short format: "Dec 25, 2024"
 */
export function formatShortDate(date: Date | string): string {
	return _format(new Date(date), FORMAT_OPTIONS.SHORT);
}

/**
 * Format date with long month: "December 25, 2024"
 */
export function formatLongDate(date: Date | string): string {
	return _format(new Date(date), FORMAT_OPTIONS.LONG_MONTH);
}

/**
 * Format month and year: "December 2024"
 */
export function formatMonthYear(date: Date | string): string {
	return _format(new Date(date), FORMAT_OPTIONS.MONTH_YEAR);
}

/**
 * Format date in ISO year-month format: "2024-12"
 */
export function formatYearMonth(date: Date | string): string {
	return _format(new Date(date), FORMAT_OPTIONS.YEAR_MONTH);
}

/**
 * Format time only without timezone conversion (for local dates)
 */
export function formatLocalTime(date: Date): string {
	return _format(date, "p");
}

/**
 * Format date only without timezone conversion (for local dates)
 */
export function formatLocalDate(date: Date): string {
	return _format(date, FORMAT_OPTIONS.DATE);
}

/**
 * Format date in short format without timezone conversion (for local dates)
 */
export function formatLocalShortDate(date: Date): string {
	return _format(date, FORMAT_OPTIONS.SHORT);
}
