import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { SECURITY_CONFIG } from "./security-config";

// Validate required environment variables
if (
	!process.env.UPSTASH_REDIS_REST_URL ||
	!process.env.UPSTASH_REDIS_REST_TOKEN
) {
	throw new Error(
		"UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required for rate limiting",
	);
}

// Initialize Redis client
const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
