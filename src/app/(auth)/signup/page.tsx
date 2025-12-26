"use client";

import { useForm } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon, Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { GoogleSignInButton } from "@/components/ui/google-signin-button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/schema";

export default function RegisterPage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");

	const [showPassword, setShowPassword] = useState(false);
	const [showPhoneDialog, setShowPhoneDialog] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			password: "",
		},
		validators: {
			onSubmit: registerSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const result = await authClient.signUp.email({
					email: value.email,
					password: value.password,
					name: value.name,
					role: "customer",
					phone: value.phone,
					callbackURL: redirect || "/",
				});

				if (result.error) {
					const errorMsg = result.error.message || "Registration failed";
					toast.error(errorMsg);
					return;
				}

				toast.success(
					"Registration successful! Please check your email for verification.",
				);
				router.push(`/login${redirect ? `?redirect=${redirect}` : ""}`);
				router.refresh();
			} catch (error: unknown) {
				console.error("Signup error:", error);
				toast.error("Something went wrong");
			}
		},
	});

	useEffect(() => {
		if (session?.user?.id) {
			router.replace("/");
			return;
		}

		// Show Google One Tap when not authenticated
		if (!isPending) {
			authClient.oneTap({
				fetchOptions: {
					onSuccess: () => {
						window.location.href = redirect || "/";
						return;
					},
				},
			});
		}
	}, [session?.user?.id, router, isPending, redirect]);

	if (isPending) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
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
						<div className="space-y-4 mb-6">
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
						</div>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-6"
							aria-label="Sign up form"
						>
							<FieldGroup>
								<form.Field
									name="name"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Name</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="Your name"
													className="h-12 text-base"
													autoComplete="name"
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="email"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Email</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													type="email"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="name@example.com"
													className="h-12 text-base"
													autoComplete="email"
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="phone"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<div className="flex items-center gap-2">
													<FieldLabel htmlFor={field.name}>
														Phone Number
													</FieldLabel>
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
																Please enter a valid phone number. We'll use
																this to get in touch with you for any order
																updates or delivery-related queries.
															</AlertDialogDescription>
															<AlertDialogAction
																onClick={() => setShowPhoneDialog(false)}
															>
																Got it
															</AlertDialogAction>
														</AlertDialogContent>
													</AlertDialog>
												</div>
												<Input
													id={field.name}
													name={field.name}
													type="tel"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="Your phone number"
													className="h-12 text-base"
													autoComplete="tel"
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="password"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Password</FieldLabel>
												<div className="relative">
													<Input
														id={field.name}
														name={field.name}
														type={showPassword ? "text" : "password"}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={isInvalid}
														placeholder="Create a password"
														className="h-12 text-base pr-10"
														autoComplete="new-password"
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
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</FieldGroup>

							<form.Subscribe
								selector={(state) => state.isSubmitting}
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(isSubmitting) => (
									<Button
										type="submit"
										className="w-full h-12 text-base"
										disabled={isSubmitting}
									>
										{isSubmitting && (
											<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
										)}
										{isSubmitting ? "Creating account..." : "Create account"}
									</Button>
								)}
							/>
						</form>
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
