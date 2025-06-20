"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex h-[calc(100svh-4rem)] flex-col items-center justify-center gap-4">
			<h2 className="text-2xl font-bold">Something went wrong!</h2>
			<p className="text-muted-foreground">
				{error.message || "An unexpected error occurred"}
			</p>
			<Button onClick={() => reset()}>Try again</Button>
		</div>
	);
}
