import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from "@/components/ui/dialog";

export default function LoginModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const router = useRouter();
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent showCloseButton>
				<DialogTitle>Sign in required</DialogTitle>
				<DialogDescription>
					Please log in or sign up to proceed to checkout. <br />
					Your cart will be saved and you can continue shopping.
				</DialogDescription>
				<DialogFooter className="flex flex-col gap-2 sm:flex-col">
					<Button
						type="button"
						className="w-full"
						onClick={() => router.push("/login?redirect=/order")}
					>
						Log In
					</Button>
					<Button
						type="button"
						className="w-full"
						variant="outline"
						onClick={() => router.push("/login/register?redirect=/order")}
					>
						Sign Up
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
