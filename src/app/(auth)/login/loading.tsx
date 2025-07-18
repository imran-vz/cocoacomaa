import { Icons } from "@/components/icons";

export default function Loading() {
	return (
		<div className="flex h-screen items-center justify-center">
			<Icons.spinner className="h-10 w-10 animate-spin" />
		</div>
	);
}
