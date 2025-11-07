"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCustomerContact } from "@/hooks/use-customer-contacts";
import type { CustomerContact } from "@/lib/db/schema";

type CustomerContactWithAddress = CustomerContact & {
	address: {
		id: number;
		addressLine1: string;
		addressLine2: string | null;
		city: string;
		state: string;
		zip: string;
	};
};

interface EditContactDialogProps {
	contact: CustomerContactWithAddress | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: (contact: CustomerContactWithAddress) => void;
}

export function EditContactDialog({
	contact,
	open,
	onOpenChange,
	onSuccess,
}: EditContactDialogProps) {
	const updateMutation = useUpdateCustomerContact();
	const nameId = useId();
	const phoneId = useId();
	const address1Id = useId();
	const address2Id = useId();
	const cityId = useId();
	const stateId = useId();
	const zipId = useId();

	const [formData, setFormData] = useState({
		name: contact?.name || "",
		phone: contact?.phone || "",
		addressLine1: contact?.address.addressLine1 || "",
		addressLine2: contact?.address.addressLine2 || "",
		city: contact?.address.city || "",
		state: contact?.address.state || "",
		zip: contact?.address.zip || "",
	});

	// Update formData when contact changes
	if (contact && formData.name !== contact.name) {
		setFormData({
			name: contact.name,
			phone: contact.phone,
			addressLine1: contact.address.addressLine1,
			addressLine2: contact.address.addressLine2 || "",
			city: contact.address.city,
			state: contact.address.state,
			zip: contact.address.zip,
		});
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!contact) return;

		try {
			const result = await updateMutation.mutateAsync({
				id: contact.id,
				data: formData,
			});

			toast.success("Contact updated successfully");
			onOpenChange(false);
			onSuccess?.(result.contact);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update contact",
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit Contact</DialogTitle>
						<DialogDescription>
							Update contact information. This creates a new contact record.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor={nameId}>Name</Label>
							<Input
								id={nameId}
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
								minLength={2}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={phoneId}>Phone</Label>
							<Input
								id={phoneId}
								type="tel"
								value={formData.phone}
								onChange={(e) =>
									setFormData({ ...formData, phone: e.target.value })
								}
								required
								pattern="[0-9+\-\s()]+"
								minLength={10}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={address1Id}>Address Line 1</Label>
							<Input
								id={address1Id}
								value={formData.addressLine1}
								onChange={(e) =>
									setFormData({ ...formData, addressLine1: e.target.value })
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={address2Id}>Address Line 2 (Optional)</Label>
							<Input
								id={address2Id}
								value={formData.addressLine2}
								onChange={(e) =>
									setFormData({ ...formData, addressLine2: e.target.value })
								}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor={cityId}>City</Label>
								<Input
									id={cityId}
									value={formData.city}
									onChange={(e) =>
										setFormData({ ...formData, city: e.target.value })
									}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor={stateId}>State</Label>
								<Input
									id={stateId}
									value={formData.state}
									onChange={(e) =>
										setFormData({ ...formData, state: e.target.value })
									}
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor={zipId}>ZIP Code</Label>
							<Input
								id={zipId}
								value={formData.zip}
								onChange={(e) =>
									setFormData({ ...formData, zip: e.target.value })
								}
								required
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
