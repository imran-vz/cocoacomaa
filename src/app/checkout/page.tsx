"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

// Generate available time slots from 12pm to 6pm
const timeSlots = [
	{ value: "12:00", label: "12:00 PM" },
	{ value: "12:30", label: "12:30 PM" },
	{ value: "13:00", label: "1:00 PM" },
	{ value: "13:30", label: "1:30 PM" },
	{ value: "14:00", label: "2:00 PM" },
	{ value: "14:30", label: "2:30 PM" },
	{ value: "15:00", label: "3:00 PM" },
	{ value: "15:30", label: "3:30 PM" },
	{ value: "16:00", label: "4:00 PM" },
	{ value: "16:30", label: "4:30 PM" },
	{ value: "17:00", label: "5:00 PM" },
	{ value: "17:30", label: "5:30 PM" },
	{ value: "18:00", label: "6:00 PM" },
];

// Calculate date constraints
const getDateConstraints = () => {
	const today = new Date();
	const minDate = new Date(today);
	minDate.setDate(today.getDate() + 3); // Minimum 3 days from today

	const maxDate = new Date(today);
	maxDate.setDate(today.getDate() + 33); // Maximum 33 days from today

	return { minDate, maxDate };
};

// Check if date is disabled (Monday, Tuesday, or outside range)
const isDateDisabled = (date: Date) => {
	const { minDate, maxDate } = getDateConstraints();
	const dayOfWeek = date.getDay();

	// Disable if before min date or after max date
	if (date < minDate || date > maxDate) {
		return true;
	}

	// Disable Monday (1) and Tuesday (2)
	return dayOfWeek === 1 || dayOfWeek === 2;
};

const checkoutFormSchema = z.object({
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	phone: z
		.string()
		.min(10, {
			message: "Phone number must be at least 10 digits.",
		})
		.regex(/^[0-9+\-\s()]+$/, {
			message: "Please enter a valid phone number.",
		}),
	pickupDate: z.date({
		required_error: "Please select a pickup date.",
	}),
	pickupTime: z.string().min(1, {
		message: "Please select a pickup time.",
	}),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
	const router = useRouter();
	const { items, total, clearCart } = useCart();

	const form = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutFormSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			pickupTime: "",
		},
	});

	const onSubmit = async (data: CheckoutFormValues) => {
		try {
			// Here you would typically process the order
			console.log("Order data:", { ...data, items, total });

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Clear the cart
			clearCart();

			// Show success message
			toast.success("Order placed successfully!");

			// Redirect to confirmation page
			router.push("/order-confirmation");
		} catch (error) {
			console.error("Error placing order:", error);
			toast.error("Failed to place order. Please try again.");
		}
	};

	if (items.length === 0) {
		return (
			<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
				<Card>
					<CardContent className="py-6 sm:py-8 text-center">
						<h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
							Your cart is empty
						</h2>
						<p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
							Add some desserts to your cart before checking out.
						</p>
						<Button onClick={() => router.push("/order")} size="lg">
							Browse Desserts
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
			<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">
				Checkout
			</h1>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
				{/* Customer Information */}
				<Card className="order-2 lg:order-1">
					<CardHeader className="pb-4 sm:pb-6">
						<CardTitle className="text-lg sm:text-xl">
							Customer Information
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4 sm:space-y-6"
							>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm sm:text-base">
												Full Name
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your full name"
													{...field}
													className="text-sm sm:text-base"
												/>
											</FormControl>
											<FormMessage className="text-xs sm:text-sm" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm sm:text-base">
												Email Address
											</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="Enter your email address"
													{...field}
													className="text-sm sm:text-base"
												/>
											</FormControl>
											<FormMessage className="text-xs sm:text-sm" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm sm:text-base">
												Phone Number
											</FormLabel>
											<FormControl>
												<Input
													type="tel"
													placeholder="Enter your phone number"
													{...field}
													className="text-sm sm:text-base"
												/>
											</FormControl>
											<FormMessage className="text-xs sm:text-sm" />
										</FormItem>
									)}
								/>

								{/* Pickup Date and Time */}
								<div className="space-y-3 sm:space-y-4 lg:space-y-6">
									<div className="border-t pt-3 sm:pt-4 lg:pt-6">
										<h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
											<CalendarIcon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0" />
											<span>Pickup Schedule</span>
										</h3>
										<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
											Select your preferred pickup date and time. Available
											Wednesday to Sunday, 12PM to 6PM. Minimum 3 days advance
											booking required.
										</p>
									</div>

									<div className="space-y-3 sm:space-y-4 lg:space-y-6">
										<FormField
											control={form.control}
											name="pickupDate"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel className="text-sm sm:text-base font-medium">
														Pickup Date
													</FormLabel>
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	variant="outline"
																	className={`w-full h-10 sm:h-11 px-3 py-2 text-left font-normal text-sm sm:text-base justify-between ${
																		!field.value && "text-muted-foreground"
																	}`}
																>
																	<span className="truncate">
																		{field.value
																			? format(field.value, "PPP")
																			: "Pick a date"}
																	</span>
																	<CalendarIcon className="h-4 w-4 opacity-50 shrink-0 ml-2" />
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-0 z-50"
															align="start"
															side="bottom"
															sideOffset={4}
														>
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={field.onChange}
																disabled={isDateDisabled}
																initialFocus
																className="rounded-md border-0"
															/>
														</PopoverContent>
													</Popover>
													<FormMessage className="text-xs sm:text-sm" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="pickupTime"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-sm sm:text-base font-medium">
														Pickup Time
													</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base">
																<SelectValue placeholder="Select time" />
															</SelectTrigger>
														</FormControl>
														<SelectContent className="max-h-[200px] sm:max-h-[300px]">
															{timeSlots.map((slot) => (
																<SelectItem
																	key={slot.value}
																	value={slot.value}
																	className="text-sm sm:text-base"
																>
																	{slot.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormMessage className="text-xs sm:text-sm" />
												</FormItem>
											)}
										/>
									</div>

									{/* Quick Summary for Mobile */}
									{(form.watch("pickupDate") || form.watch("pickupTime")) && (
										<div className="bg-muted/50 rounded-lg p-3 sm:p-4 lg:hidden">
											<div className="flex items-center gap-2 mb-2">
												<Clock className="h-4 w-4 text-muted-foreground shrink-0" />
												<span className="text-sm font-medium">
													Selected Pickup
												</span>
											</div>
											<div className="space-y-1">
												{form.watch("pickupDate") && (
													<p className="text-xs text-muted-foreground">
														📅{" "}
														{format(
															form.watch("pickupDate"),
															"EEEE, MMM d, yyyy",
														)}
													</p>
												)}
												{form.watch("pickupTime") && (
													<p className="text-xs text-muted-foreground">
														🕐{" "}
														{
															timeSlots.find(
																(t) => t.value === form.watch("pickupTime"),
															)?.label
														}
													</p>
												)}
											</div>
										</div>
									)}
								</div>

								<Button
									type="submit"
									className="w-full text-sm sm:text-base"
									disabled={form.formState.isSubmitting}
									size="lg"
								>
									{form.formState.isSubmitting
										? "Processing..."
										: "Place Order"}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				{/* Order Summary */}
				<Card className="order-1 lg:order-2">
					<CardHeader className="pb-4 sm:pb-6">
						<CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="space-y-3 sm:space-y-4">
							{items.map((item) => (
								<div
									key={item.id}
									className="flex justify-between items-start gap-2"
								>
									<div className="flex-1 min-w-0">
										<h4 className="font-medium text-sm sm:text-base leading-tight">
											{item.name}
										</h4>
										<p className="text-xs sm:text-sm text-muted-foreground">
											₹{item.price.toFixed(0)} x {item.quantity}
										</p>
									</div>
									<div className="font-medium text-sm sm:text-base shrink-0">
										₹{(item.price * item.quantity).toFixed(0)}
									</div>
								</div>
							))}

							<div className="border-t pt-3 sm:pt-4">
								<div className="flex justify-between items-center font-medium text-base sm:text-lg">
									<span>Total:</span>
									<span>₹{total.toFixed(0)}</span>
								</div>
							</div>

							{/* Pickup Info Display */}
							{(form.watch("pickupDate") || form.watch("pickupTime")) && (
								<div className="border-t pt-3 sm:pt-4">
									<div className="flex items-center gap-2 mb-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm sm:text-base font-medium">
											Pickup Details
										</span>
									</div>
									{form.watch("pickupDate") && (
										<p className="text-xs sm:text-sm text-muted-foreground">
											Date: {format(form.watch("pickupDate"), "PPP")}
										</p>
									)}
									{form.watch("pickupTime") && (
										<p className="text-xs sm:text-sm text-muted-foreground">
											Time:{" "}
											{
												timeSlots.find(
													(t) => t.value === form.watch("pickupTime"),
												)?.label
											}
										</p>
									)}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
