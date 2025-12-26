"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const createManagerSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Valid email is required"),
	phone: z.string().optional(),
});

type CreateManagerForm = z.infer<typeof createManagerSchema>;

interface CreateManagerDialogProps {
	children: React.ReactNode;
}

export function CreateManagerDialog({ children }: CreateManagerDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<CreateManagerForm>({
		resolver: zodResolver(createManagerSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
	});

	const onSubmit = async (values: CreateManagerForm) => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/admin/managers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to create manager");
			}

			toast.success("Manager created successfully");
			setOpen(false);
			form.reset();
			window.location.reload();
		} catch (error) {
			console.error("Error creating manager:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create manager",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Create Manager</DialogTitle>
					<DialogDescription>
						Add a new manager to the system. They will have read-only access to
						orders.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Manager name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="manager@example.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone (Optional)</FormLabel>
									<FormControl>
										<Input placeholder="Phone number" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "Creating..." : "Create Manager"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
