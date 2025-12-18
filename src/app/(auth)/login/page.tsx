"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import { GoogleSignInButton } from "@/components/ui/google-signin-button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/schema";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const [showPassword, setShowPassword] = useState(false);
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
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
						router.replace(redirect || "/");
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

	async function onSubmit(data: LoginFormValues) {
		try {
			const result = await authClient.signIn.email({
				email: data.email,
				password: data.password,
				rememberMe: true,
			});

			if (result.error) {
				console.error(result.error);
				if (result.error.code === "INVALID_EMAIL_OR_PASSWORD") {
					toast.error("Invalid credentials");
					form.setError("password", { message: "Invalid credentials" });
					form.setError("email", { message: "Invalid credentials" });
					return;
				}

				if (result.error.code === "EMAIL_NOT_VERIFIED") {
					toast.error(
						"Please verify your email address. Check your inbox for the verification link.",
					);
					form.setError("password", { message: "" });
					form.setError("email", {
						message: "Email not verified. Check your inbox.",
					});
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

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="m@example.com"
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
									name="password"
									render={({ field }) => (
										<FormItem>
											<div className="flex items-center">
												<FormLabel>Password</FormLabel>
												<a
													href="/forgot-password"
													className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
												>
													Forgot your password?
												</a>
											</div>
											<FormControl>
												<div className="relative">
													<Input
														type={showPassword ? "text" : "password"}
														placeholder="********"
														className="h-12 text-base pr-10"
														autoComplete="current-password"
														{...field}
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
									{form.formState.isSubmitting ? "Signing in..." : "Sign in"}
								</Button>
							</form>
						</Form>
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
