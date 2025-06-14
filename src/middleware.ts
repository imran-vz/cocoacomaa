import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

	// if (isAdminRoute) {
	// 	// In a real application, you would check for authentication here
	// 	// For now, we'll just redirect to the home page
	// 	return NextResponse.redirect(new URL("/", request.url));
	// }

	return NextResponse.next();
}

export const config = {
	matcher: "/admin/:path*",
};
