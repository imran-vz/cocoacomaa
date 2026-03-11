import { FileQuestion, Home, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-2 px-4 text-center">
			<div className="mb-2 flex items-center justify-center">
				<div className="rounded-full bg-muted p-3">
					<FileQuestion className="h-10 w-10 text-muted-foreground" />
				</div>
			</div>
			<h2 className="text-xl sm:text-2xl font-bold">Page Not Found</h2>
			<p className="text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed">
				The page you're looking for doesn't exist or has been moved. Try heading
				back to the home page or browse our desserts.
			</p>
			<div className="flex flex-col sm:flex-row gap-3 mt-4">
				<Button asChild className="gap-2">
					<Link href="/">
						<Home className="h-4 w-4" />
						Back to Home
					</Link>
				</Button>
				<Button variant="outline" asChild className="gap-2">
					<Link href="/order">
						<Search className="h-4 w-4" />
						Browse Desserts
					</Link>
				</Button>
			</div>
		</div>
	);
}
