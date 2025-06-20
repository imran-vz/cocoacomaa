"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NavButton() {
	const router = useRouter();

	return (
		<>
			<Button
				onClick={() => router.push("/order")}
				className="w-full"
				variant="outline"
			>
				Order More Desserts
			</Button>
			<Button onClick={() => router.push("/my-orders")} className="w-full">
				Back to Orders
			</Button>
		</>
	);
}
