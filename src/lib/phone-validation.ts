import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export function validatePhoneNumber(
	phoneNumber: string,
	countryCode = "IN",
): {
	isValid: boolean;
	formatted?: string;
	error?: string;
} {
	try {
		// Remove any non-digit characters except +
		const cleanedNumber = phoneNumber.replace(/[^\d+]/g, "");

		// Parse the phone number
		const number = phoneUtil.parseAndKeepRawInput(cleanedNumber, countryCode);

		// Check if the number is valid
		const isValid = phoneUtil.isValidNumber(number);

		if (isValid) {
			// Format the number in international format
			const formatted = phoneUtil.format(
				number,
				PhoneNumberFormat.INTERNATIONAL,
			);
			return { isValid: true, formatted };
		}

		return { isValid: false, error: "Invalid phone number" };
	} catch (error) {
		console.error(error);
		return { isValid: false, error: "Invalid phone number format" };
	}
}

export function formatPhoneNumber(
	phoneNumber: string,
	countryCode = "IN",
): string {
	try {
		const cleanedNumber = phoneNumber.replace(/[^\d+]/g, "");
		const number = phoneUtil.parseAndKeepRawInput(cleanedNumber, countryCode);
		return phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL);
	} catch (error) {
		console.error(error);
		return phoneNumber;
	}
}
