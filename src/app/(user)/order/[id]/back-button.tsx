"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BackButton() {
	const router = useRouter();

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={() => router.back()}
			className="shrink-0"
		>
			<ArrowLeft className="h-4 w-4" />
		</Button>
	);
}
