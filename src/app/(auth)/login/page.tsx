"use client";

import { useForm } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { GoogleSignInButton } from "@/components/ui/google-signin-button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/schema";

export default function LoginPage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const [showPassword, setShowPassword] = useState(false);
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: loginSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const result = await authClient.signIn.email({
					email: value.email,
					password: value.password,
					rememberMe: true,
				});

				if (result.error) {
					console.error(result.error);
					if (result.error.code === "INVALID_EMAIL_OR_PASSWORD") {
						toast.error("Invalid credentials");
						form.setFieldMeta("password", (prev) => ({
							...prev,
							errors: ["Invalid credentials"],
						}));
						form.setFieldMeta("email", (prev) => ({
							...prev,
							errors: ["Invalid credentials"],
						}));
						return;
					}

					if (result.error.code === "EMAIL_NOT_VERIFIED") {
						toast.error(
							"Please verify your email address. Check your inbox for the verification link.",
						);
						form.setFieldMeta("password", (prev) => ({
							...prev,
							errors: [""],
						}));
						form.setFieldMeta("email", (prev) => ({
							...prev,
							errors: ["Email not verified. Check your inbox."],
						}));
						return;
					}
				}

				if (redirect) {
					console.log("redirect", redirect);
					window.location.href = redirect;
				} else {
					console.log("no redirect");
					window.location.href = "/";
				}
			} catch (error) {
				console.error(error);
				toast.error("Something went wrong");
			}
		},
	});

	useEffect(() => {
		if (session?.user?.id) {
			console.log("redirecting to /");
			router.replace(redirect || "/");
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
	}, [session?.user?.id, router, redirect, isPending]);

	// Show loading while checking session
	if (isPending) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	// Don't render login form if user is authenticated
	if (session?.user?.id) {
		return null;
	}

	return (
		<div className="min-h-[calc(100svh-10rem)] flex items-center justify-center px-2 py-8 bg-background">
			<div className="w-full max-w-sm md:max-w-md flex flex-col justify-center space-y-6 mx-auto">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Welcome back
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your credentials to sign in to your account
					</p>
				</div>

				<Card className="shadow-md border border-gray-200">
					<CardContent className="pt-6">
						{/* Google Sign-In Button */}
						<div className="space-y-4 mb-6">
							<GoogleSignInButton
								text="Sign in with Google"
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
						>
							<form.Field
								name="email"
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									const hasErrors =
										field.state.meta.errors &&
										field.state.meta.errors.length > 0;
									return (
										<Field data-invalid={isInvalid || hasErrors}>
											<FieldLabel htmlFor={field.name}>Email</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="email"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid || hasErrors}
												placeholder="m@example.com"
												className="h-12 text-base"
												autoComplete="email"
											/>
											{(isInvalid || hasErrors) && (
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
									const hasErrors =
										field.state.meta.errors &&
										field.state.meta.errors.length > 0;
									return (
										<Field data-invalid={isInvalid || hasErrors}>
											<div className="flex items-center">
												<FieldLabel htmlFor={field.name}>Password</FieldLabel>
												<a
													href="/forgot-password"
													className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
												>
													Forgot your password?
												</a>
											</div>
											<div className="relative">
												<Input
													id={field.name}
													name={field.name}
													type={showPassword ? "text" : "password"}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid || hasErrors}
													placeholder="********"
													className="h-12 text-base pr-10"
													autoComplete="current-password"
												/>
												<button
													type="button"
													className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
													onClick={() => setShowPassword(!showPassword)}
													aria-label={
														showPassword ? "Hide password" : "Show password"
													}
												>
													{showPassword ? <EyeOffIcon /> : <EyeIcon />}
												</button>
											</div>
											{(isInvalid || hasErrors) && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<form.Subscribe
								selector={(state) => state.isSubmitting}
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(isSubmitting) => (
									<Button
										type="submit"
										className="w-full h-12 text-base"
										disabled={isSubmitting}
									>
										{isSubmitting ? "Signing in..." : "Sign in"}
									</Button>
								)}
							/>
						</form>
					</CardContent>
				</Card>
				<div className="text-center text-sm text-muted-foreground mt-2">
					Don&apos;t have an account?{" "}
					<a
						href={`/signup${redirect ? `?redirect=${redirect}` : ""}`}
						className="underline underline-offset-4"
					>
						Sign up
					</a>
				</div>
			</div>
		</div>
	);
}
