"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const dessertSchema = z.object({
	name: z.string().min(1, "Name is required"),
	price: z.string().min(1, "Price is required"),
	description: z.string().min(1, "Description is required"),
	status: z.enum(["available", "unavailable"]),
});

type DessertFormValues = z.infer<typeof dessertSchema>;

interface DessertFormProps {
	mode: "create" | "edit";
	initialData?: DessertFormValues & { id?: number };
}

export function DessertForm({ mode, initialData }: DessertFormProps) {
	const router = useRouter();
	const form = useForm<DessertFormValues>({
		resolver: zodResolver(dessertSchema),
		defaultValues: initialData || {
			name: "",
			price: "",
			description: "",
			status: "available",
		},
	});

	useEffect(() => {
		if (mode === "edit" && !initialData) {
			toast.error("Failed to load dessert data");
			router.push("/admin");
		}
	}, [mode, initialData, router]);

	async function onSubmit(data: DessertFormValues) {
		try {
			const response = await fetch(
				mode === "create"
					? "/api/desserts"
					: `/api/desserts/${initialData?.id}`,
				{
					method: mode === "create" ? "POST" : "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to save dessert");
			}

			toast.success(mode === "create" ? "Dessert created" : "Dessert updated");
			router.push("/admin");
			router.refresh();
		} catch (error) {
			console.error(error);
			toast.error("Something went wrong");
		}
	}

	return (
		<div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle>
						{mode === "edit" ? "Edit Dessert" : "Add New Dessert"}
					</CardTitle>
					<CardDescription>
						{mode === "edit"
							? "Update the details of your dessert"
							: "Create a new dessert item"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input placeholder="Enter dessert name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Price</FormLabel>
											<FormControl>
												<Input placeholder="Enter price" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter dessert description"
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="available">Available</SelectItem>
												<SelectItem value="unavailable">Unavailable</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
								>
									Cancel
								</Button>
								<Button type="submit">
									{mode === "create" ? "Create Dessert" : "Update Dessert"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
