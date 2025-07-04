"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { EyeIcon, EyeOffIcon, Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Icons } from "@/components/icons";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/schema";

type SignupFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
	const router = useRouter();
	const { data } = useSession();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");

	const [showPassword, setShowPassword] = useState(false);
	const [showPhoneDialog, setShowPhoneDialog] = useState(false);

	const form = useForm<SignupFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			password: "",
		},
	});

	useEffect(() => {
		if (data?.user.id) {
			router.replace("/");
			return;
		}
	}, [data?.user?.id, router]);

	async function onSubmit(data: SignupFormValues) {
		try {
			await axios.post("/api/register", data, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			});

			toast.success("Registration successful! Please log in.");
			router.push(`/login${redirect ? `?redirect=${redirect}` : ""}`);
			router.refresh();
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				if (error.response?.data.errors) {
					const errors = Object.keys(error.response?.data.errors).map((key) =>
						error.response?.data.errors[key]?.join("\n"),
					);
					if (errors.length > 0) {
						toast.error(
							<div>
								<ul className="list-disc list-inside space-y-1">
									{errors.map((error) => (
										<li key={error}>{error}</li>
									))}
								</ul>
							</div>,
						);
						return;
					}

					toast.error(error.response?.data.message || "Something went wrong");
					return;
				}

				toast.error(error.response?.data.message || "Something went wrong");
				return;
			}

			toast.error("Something went wrong");
			return;
		}
	}

	return (
		<div className="min-h-[calc(100svh-10rem)] flex items-center justify-center px-2 py-8 bg-background">
			<div className="w-full max-w-sm px-4 sm:px-0 sm:max-w-sm md:max-w-md flex flex-col justify-center space-y-6 mx-auto">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Create an account
					</h1>
					<p className="text-sm text-muted-foreground">
						Sign up to order desserts and more
					</p>
				</div>
				<Card className="shadow-md border border-gray-200">
					<CardContent className="pt-6">
						{/* Google Sign-In Button */}
						{/* <div className="space-y-4 mb-6">
							<GoogleSignInButton
								text="Sign up with Google"
								redirect={redirect}
							/>

							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Or continue with
									</span>
								</div>
							</div>
						</div> */}

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
								aria-label="Sign up form"
							>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input
													placeholder="Your name"
													className="h-12 text-base"
													autoComplete="name"
													{...field}
												/>
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
													placeholder="name@example.com"
													className="h-12 text-base"
													autoComplete="email"
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
											<div className="flex items-center gap-2">
												<FormLabel>Phone Number</FormLabel>
												<AlertDialog
													open={showPhoneDialog}
													onOpenChange={setShowPhoneDialog}
												>
													<AlertDialogTrigger asChild>
														<button
															type="button"
															aria-label="Why do we need your phone number?"
															className="text-blue-500 hover:text-blue-700 focus:outline-none"
														>
															<Info className="h-4 w-4" />
														</button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogTitle>
															Why do we need your phone number?
														</AlertDialogTitle>
														<AlertDialogDescription>
															Please enter a valid phone number. We'll use this
															to get in touch with you for any order updates or
															delivery-related queries.
														</AlertDialogDescription>
														<AlertDialogAction
															onClick={() => setShowPhoneDialog(false)}
														>
															Got it
														</AlertDialogAction>
													</AlertDialogContent>
												</AlertDialog>
											</div>
											<FormControl>
												<Input
													type="tel"
													placeholder="Your phone number"
													className="h-12 text-base"
													autoComplete="tel"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showPassword ? "text" : "password"}
														placeholder="Create a password"
														className="h-12 text-base pr-10"
														autoComplete="new-password"
														{...field}
													/>
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
													>
														{showPassword ? (
															<EyeOffIcon className="h-4 w-4" />
														) : (
															<EyeIcon className="h-4 w-4" />
														)}
													</button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									className="w-full h-12 text-base"
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting && (
										<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
									)}
									{form.formState.isSubmitting
										? "Creating account..."
										: "Create account"}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				<div className="text-center text-sm text-muted-foreground mt-2">
					Already have an account?{" "}
					<a
						href={`/login${redirect ? `?redirect=${redirect}` : ""}`}
						className="underline"
					>
						Sign in
					</a>
				</div>
			</div>
		</div>
	);
}
