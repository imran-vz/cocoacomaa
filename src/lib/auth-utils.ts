import { NextResponse } from "next/server";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

/**
 * Throws an error if session is not authenticated or user doesn't have required role
 * @param session - Better Auth session
 * @param allowedRoles - Optional array of roles that are allowed to access
 * @throws Error if unauthorized
 */
export function requireAuth(session: Session | null, allowedRoles?: string[]) {
	if (!session?.user?.id) {
		throw new Error("Unauthorized - No valid session");
	}

	if (allowedRoles && allowedRoles.length > 0) {
		const user = session.user;
		const userRole = user.role;
		if (!userRole || !allowedRoles.includes(userRole)) {
			throw new Error(
				`Forbidden - Required role: ${allowedRoles.join(" or ")}`,
			);
		}
	}
}

/**
 * Returns user ID from session, throws if not authenticated
 * @param session - Better Auth session
 * @returns User ID
 * @throws Error if no session or user ID
 */
export function requireSessionId(session: Session | null): string {
	if (!session?.user?.id) {
		throw new Error("Unauthorized - No valid session");
	}
	return session.user.id;
}

/**
 * Checks if session user has admin role
 * @param session - Better Auth session
 * @returns true if user is admin
 */
export function isAdmin(session: Session | null): boolean {
	return session?.user?.role === "admin";
}

/**
 * Checks if session user has manager role
 * @param session - Better Auth session
 * @returns true if user is manager
 */
export function isManager(session: Session | null): boolean {
	return session?.user?.role === "manager";
}

/**
 * Checks if session user has the specified role
 * @param session - Better Auth session
 * @param role - Role to check
 * @returns true if user has the role
 */
export function hasRole(session: Session | null, role: string): boolean {
	return session?.user?.role === role;
}

/**
 * Creates a standardized 401 Unauthorized response
 * @param message - Optional custom message
 * @returns NextResponse with 401 status
 */
export function createUnauthorizedResponse(message = "Unauthorized") {
	return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Creates a standardized 403 Forbidden response
 * @param message - Optional custom message
 * @returns NextResponse with 403 status
 */
export function createForbiddenResponse(message = "Forbidden") {
	return NextResponse.json({ error: message }, { status: 403 });
}
