import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
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

		const blob = await put(filename, request.body, {
			access: "public",
		});

		return NextResponse.json({ url: blob.url });
	} catch (error) {
		console.error("Error uploading file:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 },
		);
	}
}
