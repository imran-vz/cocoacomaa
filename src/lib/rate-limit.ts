import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { SECURITY_CONFIG } from "./security-config";

// Validate required environment variables
if (!process.env.KV_URL || !process.env.KV_REST_API_TOKEN) {
	throw new Error(
		"KV_URL and KV_REST_API_TOKEN environment variables are required for rate limiting",
	);
}

// Initialize Redis client
const redis = Redis.fromEnv();

// Create rate limiters for different operations
export const loginLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(
		SECURITY_CONFIG.rateLimits.login.requests,
		`${SECURITY_CONFIG.rateLimits.login.window} ms`,
	),
	analytics: true,
	prefix: "ratelimit:login",
});

export const otpGenerateLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(
		SECURITY_CONFIG.rateLimits.otpGenerate.requests,
		`${SECURITY_CONFIG.rateLimits.otpGenerate.window} ms`,
	),
	analytics: true,
	prefix: "ratelimit:otp-generate",
});

export const otpVerifyLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(
		SECURITY_CONFIG.rateLimits.otpVerify.requests,
		`${SECURITY_CONFIG.rateLimits.otpVerify.window} ms`,
	),
	analytics: true,
	prefix: "ratelimit:otp-verify",
});

export const apiMutationLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(
		SECURITY_CONFIG.rateLimits.apiMutation.requests,
		`${SECURITY_CONFIG.rateLimits.apiMutation.window} ms`,
	),
	analytics: true,
	prefix: "ratelimit:api-mutation",
});

export const uploadLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(
		SECURITY_CONFIG.rateLimits.upload.requests,
		`${SECURITY_CONFIG.rateLimits.upload.window} ms`,
	),
	analytics: true,
	prefix: "ratelimit:upload",
});

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier for the rate limit (e.g., email, userId, IP)
 * @param limiter - The rate limiter to use
 * @returns Object with success status, limit info, and reset time
 */
export async function checkRateLimit(
	identifier: string,
	limiter: Ratelimit,
): Promise<{
	success: boolean;
	limit: number;
	remaining: number;
	reset: number;
}> {
	const { success, limit, remaining, reset } = await limiter.limit(identifier);

	return {
		success,
		limit,
		remaining,
		reset,
	};
}
