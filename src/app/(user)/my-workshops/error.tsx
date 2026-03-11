"use client";

import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MyWorkshopsError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const router = useRouter();

	useEffect(() => {
		console.error("My workshops error:", error);
	}, [error]);

	return (
		<div className="container mx-auto py-6 sm:py-8 lg:py-12 px-4 min-h-[calc(100svh-11rem)]">
			<div className="max-w-lg mx-auto">
				<Card>
					<CardContent className="py-8 sm:py-10 text-center">
						<div className="mb-4 flex items-center justify-center">
							<div className="rounded-full bg-destructive/10 p-3">
								<AlertCircle className="h-8 w-8 text-destructive/70" />
							</div>
						</div>
						<h2 className="text-xl sm:text-2xl font-bold mb-2">
							Couldn't Load Your Workshops
						</h2>
						<p className="text-muted-foreground text-sm sm:text-base mb-2 max-w-sm mx-auto leading-relaxed">
							We had trouble loading your workshop registrations. This is
							usually temporary — please try again.
						</p>
						{error.digest && (
							<p className="text-xs text-muted-foreground/60 mb-6">
								Error reference: {error.digest}
							</p>
						)}
						<div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
							<Button onClick={() => reset()} className="gap-2">
								<RotateCcw className="h-4 w-4" />
								Try Again
							</Button>
							<Button
								variant="outline"
								onClick={() => router.push("/workshops")}
								className="gap-2"
							>
								<ArrowLeft className="h-4 w-4" />
								Browse Workshops
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
