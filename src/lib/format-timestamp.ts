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

/**
 * Format a 24h time string (e.g., "10:00" or "13:30") to 12h format (e.g., "10:00 AM" or "1:30 PM")
 */
export function formatWorkshopTime(time: string): string {
	const [hours, minutes] = time.split(":").map(Number);
	if (
		hours === undefined ||
		minutes === undefined ||
		Number.isNaN(hours) ||
		Number.isNaN(minutes)
	) {
		return time;
	}
	// Create a dummy date with the time to leverage date-fns formatting
	const dummyDate = new Date(2000, 0, 1, hours, minutes);
	return format(dummyDate, FORMAT_OPTIONS.TIME);
}

/**
 * Format a workshop date string (YYYY-MM-DD) with day name: "Sunday, Mar 20, 2026"
 */
export function formatWorkshopDate(dateStr: string): string {
	const date = new Date(`${dateStr}T12:00:00`);
	return _format(date, "EEEE, MMM d, yyyy");
}

/**
 * Format a full workshop schedule summary.
 * Returns e.g., "Sunday, Mar 20, 2026 | 10:00 AM - 1:00 PM"
 * Returns null if any field is missing.
 */
export function formatWorkshopSchedule(
	date: string | null | undefined,
	startTime: string | null | undefined,
	endTime: string | null | undefined,
): string | null {
	if (!date || !startTime || !endTime) {
		return null;
	}
	const formattedDate = formatWorkshopDate(date);
	const formattedStart = formatWorkshopTime(startTime);
	const formattedEnd = formatWorkshopTime(endTime);
	return `${formattedDate} | ${formattedStart} - ${formattedEnd}`;
}
