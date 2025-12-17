export const SECURITY_CONFIG = {
	bcryptRounds: 12,
	otpLength: 6,
	otpExpiryMinutes: 15,
	otpMaxAttempts: 5,

	rateLimits: {
		login: { requests: 5, window: 900000 }, // 5 per 15min
		otpGenerate: { requests: 1, window: 7200000 }, // 1 per 2hr
		otpVerify: { requests: 5, window: 900000 }, // 5 per 15min
		apiMutation: { requests: 100, window: 3600000 }, // 100 per hour
		upload: { requests: 10, window: 3600000 }, // 10 per hour
	},

	upload: {
		maxSizeBytes: 5 * 1024 * 1024, // 5MB
		allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
	},
} as const;
