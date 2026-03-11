"use client";

import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const router = useRouter();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-2 px-4 text-center">
			<div className="mb-2 flex items-center justify-center">
				<div className="rounded-full bg-destructive/10 p-3">
					<AlertCircle className="h-10 w-10 text-destructive/70" />
				</div>
			</div>
			<h2 className="text-xl sm:text-2xl font-bold">Something went wrong</h2>
			<p className="text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed">
				We ran into an unexpected problem. This is usually temporary — please
				try again or head back to the home page.
			</p>
			{error.digest && (
				<p className="text-xs text-muted-foreground/60 mt-1">
					Error reference: {error.digest}
				</p>
			)}
			<div className="flex flex-col sm:flex-row gap-3 mt-4">
				<Button onClick={() => reset()} className="gap-2">
					<RotateCcw className="h-4 w-4" />
					Try Again
				</Button>
				<Button
					variant="outline"
					onClick={() => router.push("/")}
					className="gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Home
				</Button>
			</div>
		</div>
	);
}
