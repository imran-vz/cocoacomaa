"use client";

import { Pencil } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCustomerContacts } from "@/hooks/use-customer-contacts";
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

interface RecipientContactSelectorProps {
	selectedContactId: number | undefined;
	onContactSelect: (contact: CustomerContactWithAddress | null) => void;
	onEditContact: (contact: CustomerContactWithAddress) => void;
}

export function RecipientContactSelector({
	selectedContactId,
	onContactSelect,
	onEditContact,
}: RecipientContactSelectorProps) {
	const { data, isLoading } = useCustomerContacts();
	const selectId = useId();

	const contacts = data?.contacts || [];
	const selectedContact = contacts.find((c) => c.id === selectedContactId);

	if (isLoading) {
		return (
			<div className="text-sm text-muted-foreground">Loading contacts...</div>
		);
	}

	if (contacts.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="saved-contact">Saved Contacts</Label>
				<div className="flex gap-2">
					<Select
						value={selectedContactId?.toString() || ""}
						onValueChange={(value) => {
							if (value === "") {
								onContactSelect(null);
							} else {
								const contact = contacts.find(
									(c) => c.id === Number.parseInt(value, 10),
								);
								if (contact) {
									onContactSelect(contact);
								}
							}
						}}
					>
						<SelectTrigger id={selectId}>
							<SelectValue placeholder="Select a saved contact" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">New contact</SelectItem>
							{contacts.map((contact) => (
								<SelectItem key={contact.id} value={contact.id.toString()}>
									{contact.name} - {contact.phone}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{selectedContact && (
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() => onEditContact(selectedContact)}
						>
							<Pencil className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{selectedContact && (
				<div className="rounded-lg border p-4 space-y-2 text-sm">
					<div>
						<strong>Name:</strong> {selectedContact.name}
					</div>
					<div>
						<strong>Phone:</strong> {selectedContact.phone}
					</div>
					<div>
						<strong>Address:</strong>
						<div className="text-muted-foreground">
							{selectedContact.address.addressLine1}
							{selectedContact.address.addressLine2 && (
								<>, {selectedContact.address.addressLine2}</>
							)}
							<br />
							{selectedContact.address.city}, {selectedContact.address.state}{" "}
							{selectedContact.address.zip}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
