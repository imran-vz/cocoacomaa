"use client";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CopyAddressButtonProps {
	address?: string;
}

export default function CopyAddressButton({ address }: CopyAddressButtonProps) {
	const copyAddress = async () => {
		const addressText =
			address ||
			"Akshaya Gold Apartment, Pipe Line Rd, VGS Layout, Ejipura, Bengaluru - 560047";
		try {
			await navigator.clipboard.writeText(addressText);
			toast.success("Address copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy address:", error);
			toast.error("Failed to copy address");
		}
	};

	return (
		<Button
			variant="outline"
			size="icon"
			className="h-8 w-8 shrink-0"
			onClick={copyAddress}
			title="Copy address"
		>
			<Copy className="h-3 w-3" />
		</Button>
	);
}
