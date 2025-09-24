"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ManagerNavButton() {
	const router = useRouter();

	return (
		<Button
			variant="outline"
			onClick={() => router.push("/manager/orders")}
			className="flex items-center gap-2"
		>
			<ArrowLeft className="h-4 w-4" />
			Back to Orders
		</Button>
	);
}
