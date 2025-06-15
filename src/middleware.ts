import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./app/api/auth/auth";

export default async function middleware(req: NextRequest) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.redirect(new URL("/", req.url));
	}
}

export const config = {
	matcher: ["/admin/:path*"],
};
