"use client";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CopyPhoneButton() {
	const copyPhone = async () => {
		const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "";
		try {
			await navigator.clipboard.writeText(phone);
			toast.success("Phone number copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy phone number:", error);
			toast.error("Failed to copy phone number");
		}
	};

	return (
		<Button
			variant="outline"
			size="icon"
			className="h-8 w-8 shrink-0"
			onClick={copyPhone}
			title="Copy phone number"
		>
			<Copy className="h-3 w-3" />
		</Button>
	);
}
