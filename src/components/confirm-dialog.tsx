"use client";

import type React from "react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * A custom confirm dialog that uses the shadcn/ui AlertDialog and returns a boolean if the user confirms the action
 *
 * @example
 * const confirmed = await confirm({
 *   title: "Delete Address",
 *   description: "Are you sure you want to delete this address? This action cannot be undone.",
 * });
 *
 *
 * @param {Object} options
 * @param {string} options.title - The title of the dialog
 * @param {React.ReactNode} options.description - The description of the dialog
 * @returns boolean if the user confirms the action
 */
export function confirm({
	title,
	description,
}: {
	title: string;
	description: React.ReactNode;
}): Promise<boolean> {
	return new Promise((resolve) => {
		// Wrapper to handle cleanup and resolution
		const resolveWithCleanup = (value: boolean) => {
			resolve(value);
			cleanup();
		};

		const ConfirmDialog = () => {
			const [isOpen, setIsOpen] = useState(true);

			const handleConfirm = () => {
				setIsOpen(false);
				resolveWithCleanup(true);
			};

			const handleCancel = () => {
				setIsOpen(false);
				resolveWithCleanup(false);
			};

			return (
				<AlertDialog
					open={isOpen}
					onOpenChange={(open) => {
						if (!open) {
							resolveWithCleanup(false);
						}
						setIsOpen(open);
					}}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>{title}</AlertDialogTitle>
							<AlertDialogDescription>{description}</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={handleCancel}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction onClick={handleConfirm}>
								Confirm
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			);
		};

		// Render the dialog component
		const container = document.createElement("div");
		container.id = "confirm-dialog-container";
		document.body.appendChild(container);

		const root = createRoot(container);

		// Clean up after dialog closes
		const cleanup = () => {
			setTimeout(() => {
				document.body.removeChild(container);
				root.unmount();
			}, 100);
		};

		root.render(<ConfirmDialog />);
	});
}
