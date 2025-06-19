"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NavButton() {
	const router = useRouter();

	return (
		<>
			<Button onClick={() => router.push("/admin/orders")} variant="outline">
				Back to Orders
			</Button>
			<Button onClick={() => router.push("/admin")}>
				Back to Dashboard
			</Button>{" "}
		</>
	);
}
