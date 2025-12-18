"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { authClient } from "@/lib/auth-client";

const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(6, { message: "Password must be at least 6 characters." }),
		confirmPassword: z
			.string()
			.min(6, { message: "Please confirm your password." }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match.",
		path: ["confirmPassword"],
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	// Redirect if already logged in or no token provided
	useEffect(() => {
		if (session?.user?.id) {
			router.replace("/");
			return;
		}
		if (!token) {
			toast.error("Invalid or expired reset link");
			router.replace("/forgot-password");
			return;
		}
	}, [session?.user?.id, router, token]);

	async function onSubmit(data: ResetPasswordFormValues) {
		if (!token) {
			toast.error("Invalid or expired reset link");
			return;
		}

		try {
			const result = await authClient.resetPassword({
				newPassword: data.password,
				token,
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to reset password");
				return;
			}

			toast.success(
				"Password reset successfully! Please log in with your new password.",
			);
			router.push("/login");
		} catch (error: unknown) {
			console.error("Reset password error:", error);
			toast.error("Something went wrong");
		}
	}

	if (!token) {
		return null; // Will redirect in useEffect
	}

	return (
		<div className="min-h-[calc(100svh-10rem)] flex items-center justify-center px-2 py-8 bg-background">
			<div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col justify-center space-y-6 mx-auto">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Reset your password
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your new password below
					</p>
				</div>

				<Card className="shadow-md border border-gray-200">
					<CardContent className="pt-6">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showPassword ? "text" : "password"}
														placeholder="Enter new password"
														className="h-12 text-base pr-10"
														autoComplete="new-password"
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

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm New Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showConfirmPassword ? "text" : "password"}
														placeholder="Confirm new password"
														className="h-12 text-base pr-10"
														autoComplete="new-password"
														{...field}
													/>
													<button
														type="button"
														className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
														onClick={() =>
															setShowConfirmPassword(!showConfirmPassword)
														}
														aria-label={
															showConfirmPassword
																? "Hide password"
																: "Show password"
														}
													>
														{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
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
									{form.formState.isSubmitting
										? "Resetting..."
										: "Reset Password"}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				<div className="flex items-center justify-center">
					<Link
						href="/forgot-password"
						className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to forgot password
					</Link>
				</div>
			</div>
		</div>
	);
}
