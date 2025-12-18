import { put } from "@vercel/blob";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
	createForbiddenResponse,
	createUnauthorizedResponse,
	requireAuth,
} from "@/lib/auth-utils";
import { checkRateLimit, uploadLimiter } from "@/lib/rate-limit";
import { SECURITY_CONFIG } from "@/lib/security-config";

export async function POST(request: NextRequest) {
	try {
		// Check authentication and admin role
		const session = await auth.api.getSession({ headers: await headers() });
		requireAuth(session, ["admin"]);

		// Aggressive rate limiting for uploads
		const rateLimitResult = await checkRateLimit(
			`upload:${session?.user?.id}`,
			uploadLimiter,
		);

		if (!rateLimitResult.success) {
			return NextResponse.json(
				{
					error: "Upload limit exceeded. Please try again later.",
					resetAt: new Date(rateLimitResult.reset),
				},
				{ status: 429 },
			);
		}

		const { searchParams } = new URL(request.url);
		const filename = searchParams.get("filename");

		if (!filename) {
			return NextResponse.json(
				{ error: "Filename is required" },
				{ status: 400 },
			);
		}

		if (!request.body) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Get content type and length from headers
		const contentType = request.headers.get("content-type");
		const contentLength = request.headers.get("content-length");

		// Validate file type
		if (
			!contentType ||
			!SECURITY_CONFIG.upload.allowedMimeTypes.includes(
				contentType as (typeof SECURITY_CONFIG.upload.allowedMimeTypes)[number],
			)
		) {
			return NextResponse.json(
				{
					error: `Invalid file type. Allowed types: ${SECURITY_CONFIG.upload.allowedMimeTypes.join(", ")}`,
				},
				{ status: 400 },
			);
		}

		// Validate file size
		if (contentLength) {
			const size = Number.parseInt(contentLength, 10);
			if (size > SECURITY_CONFIG.upload.maxSizeBytes) {
				return NextResponse.json(
					{
						error: `File size exceeds maximum allowed size of ${SECURITY_CONFIG.upload.maxSizeBytes / (1024 * 1024)}MB`,
					},
					{ status: 400 },
				);
			}
		}

		const blob = await put(filename, request.body, {
			access: "public",
			contentType, // Explicitly set content type
		});

		return NextResponse.json({ url: blob.url });
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("Unauthorized")) {
				return createUnauthorizedResponse(error.message);
			}
			if (error.message.includes("Forbidden")) {
				return createForbiddenResponse(error.message);
			}
		}
		console.error("Error uploading file:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 },
		);
	}
}
