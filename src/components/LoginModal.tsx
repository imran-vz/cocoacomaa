import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";

export default function LoginModal({
	open,
	onClose,
}: { open: boolean; onClose: () => void }) {
	const router = useRouter();
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent showCloseButton>
				<DialogTitle>Sign in required</DialogTitle>
				<DialogDescription>
					Please log in or sign up to proceed to checkout. <br />
					Your cart will be saved and you can continue shopping.
				</DialogDescription>
				<DialogFooter className="flex flex-col gap-2">
					<Button
						type="button"
						className="w-full"
						onClick={() => router.push("/login")}
					>
						Log In
					</Button>
					<Button
						type="button"
						className="w-full"
						variant="outline"
						onClick={() => router.push("/login/register")}
					>
						Sign Up
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
