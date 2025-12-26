"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowLeft, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const resetPasswordSchema = z
	.object({
		password: z.string().min(6, {
			message: "Password must be at least 6 characters.",
		}),
		confirmPassword: z.string().min(6, {
			message: "Please confirm your password.",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords don't match.",
	});

export default function ResetPasswordPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onSubmit: resetPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			if (!token) {
				toast.error("Invalid or expired reset link");
				return;
			}

			try {
				const result = await authClient.resetPassword({
					newPassword: value.password,
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
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-6"
						>
							<FieldGroup>
								<form.Field
									name="password"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													New Password
												</FieldLabel>
												<div className="relative">
													<Input
														id={field.name}
														name={field.name}
														type={showPassword ? "text" : "password"}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={isInvalid}
														placeholder="Enter new password"
														className="h-12 text-base pr-10"
														autoComplete="new-password"
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
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="confirmPassword"
									// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Confirm New Password
												</FieldLabel>
												<div className="relative">
													<Input
														id={field.name}
														name={field.name}
														type={showConfirmPassword ? "text" : "password"}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={isInvalid}
														placeholder="Confirm new password"
														className="h-12 text-base pr-10"
														autoComplete="new-password"
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
										{isSubmitting ? "Resetting..." : "Reset Password"}
									</Button>
								)}
							/>
						</form>
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
