import Razorpay from "razorpay";

if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
	throw new Error(
		"NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable is required",
	);
}
if (!process.env.RAZORPAY_KEY_SECRET) {
	throw new Error("RAZORPAY_KEY_SECRET environment variable is required");
}

/**
 * Singleton Razorpay client instance.
 * All server-side code should import from here instead of creating their own.
 */
export const razorpay = new Razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});
