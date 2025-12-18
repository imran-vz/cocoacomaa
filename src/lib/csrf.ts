import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Gets the CSRF secret from environment or generates a random one (dev only)
 * In production, BETTER_AUTH_SECRET should be used as the signing secret
 */
function getCsrfSecret(): string {
	const secret = process.env.BETTER_AUTH_SECRET;
	if (!secret) {
		throw new Error("BETTER_AUTH_SECRET is required for CSRF protection");
	}
	return secret;
}

/**
 * Signs a CSRF token with HMAC
 */
function signToken(token: string): string {
	const secret = getCsrfSecret();
	const hmac = createHmac("sha256", secret);
	hmac.update(token);
	return hmac.digest("hex");
}

/**
 * Verifies a signed CSRF token
 */
function verifyToken(token: string, signature: string): boolean {
	const expectedSignature = signToken(token);
	// Use constant-time comparison to prevent timing attacks
	return (
		signature.length === expectedSignature.length &&
		createHmac("sha256", getCsrfSecret()).update(signature).digest("hex") ===
			createHmac("sha256", getCsrfSecret())
				.update(expectedSignature)
				.digest("hex")
	);
}

/**
 * Generates a new CSRF token and sets it as a cookie
 * @returns The generated CSRF token
 */
export async function generateCsrfToken(): Promise<string> {
	const token = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
	const signature = signToken(token);
	const signedToken = `${token}.${signature}`;

	// Set the token as an HTTP-only cookie
	const cookieStore = await cookies();
	cookieStore.set(CSRF_COOKIE_NAME, signedToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24, // 24 hours
	});

	// Return the token (not the signature) for the client to include in headers
	return token;
}

/**
 * Validates CSRF token from request
 * Compares the token in the x-csrf-token header with the signed token in cookies
 * @param request - The incoming request
 * @throws Error if CSRF validation fails
 */
export async function validateCsrfToken(request: NextRequest): Promise<void> {
	// Get token from header
	const headerToken = request.headers.get(CSRF_HEADER_NAME);
	if (!headerToken) {
		throw new Error("CSRF token missing from request header");
	}

	// Get signed token from cookie
	const cookieStore = await cookies();
	const cookieValue = cookieStore.get(CSRF_COOKIE_NAME)?.value;
	if (!cookieValue) {
		throw new Error("CSRF token missing from cookies");
	}

	// Parse signed token
	const [token, signature] = cookieValue.split(".");
	if (!token || !signature) {
		throw new Error("Invalid CSRF token format");
	}

	// Verify signature
	if (!verifyToken(token, signature)) {
		throw new Error("CSRF token signature verification failed");
	}

	// Compare tokens (double-submit cookie pattern)
	if (token !== headerToken) {
		throw new Error("CSRF token mismatch");
	}
}

/**
 * Middleware wrapper for API routes that require CSRF protection
 * @param handler - The API route handler
 * @returns Wrapped handler with CSRF validation
 */
export function withCsrf<T extends NextRequest>(
	handler: (request: T) => Promise<NextResponse>,
) {
	return async (request: T): Promise<NextResponse> => {
		try {
			await validateCsrfToken(request);
			return await handler(request);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "CSRF validation failed";
			return NextResponse.json({ error: message }, { status: 403 });
		}
	};
}
