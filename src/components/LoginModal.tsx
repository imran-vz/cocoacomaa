"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { loginSchema } from "@/lib/schema";

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginModalProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	redirect?: string;
}

export default function LoginModal({
	open,
	onClose,
	onSuccess,
	redirect,
}: LoginModalProps) {
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: LoginFormValues) {
		try {
			const result = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (result?.error) {
				toast.error("Invalid credentials");
				form.setError("password", { message: "Invalid credentials" });
				form.setError("email", { message: "Invalid credentials" });
				return;
			}

			toast.success("Successfully signed in!");
			onClose();
			onSuccess?.();

			// Redirect after successful login if specified
			if (redirect) {
				window.location.href = redirect;
			} else {
				// Refresh the page to update authentication state
				window.location.reload();
			}
		} catch (error) {
			console.error(error);
			toast.error("Something went wrong");
		}
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Sign in to continue</DialogTitle>
					<DialogDescription>
						Please sign in to access specials and continue shopping.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Google Sign-In Button */}
					<GoogleSignInButton text="Sign in with Google" redirect={redirect} />

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with email
							</span>
						</div>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
												onClick={() => onClose()}
											>
												Forgot password?
											</a>
										</div>
										<FormControl>
											<div className="relative">
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="Enter your password"
													autoComplete="current-password"
													className="pr-10"
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
								className="w-full"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting ? "Signing in..." : "Sign in"}
							</Button>
						</form>
					</Form>

					<div className="text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<a
							href={`/signup${redirect ? `?redirect=${redirect}` : ""}`}
							className="underline underline-offset-4 hover:text-primary"
							onClick={() => onClose()}
						>
							Sign up
						</a>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
