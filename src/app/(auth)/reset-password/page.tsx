"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Input } from "@/components/ui/input";
import { resetPasswordSchema } from "@/lib/schema";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
	const router = useRouter();
	const { data } = useSession();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const searchParams = useSearchParams();
	const email = searchParams.get("email");

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			token: "",
			email: email || "",
			password: "",
			confirmPassword: "",
		},
	});

	// Redirect if already logged in or no email provided
	useEffect(() => {
		if (data?.user.id) {
			router.replace("/");
			return;
		}
		if (!email) {
			router.replace("/forgot-password");
			return;
		}
	}, [data?.user?.id, router, email]);

	async function onSubmit(data: ResetPasswordFormValues) {
		try {
			await axios.post("/api/auth/reset-password", data, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			});

			toast.success(
				"Password reset successfully! Please log in with your new password.",
			);
			router.push("/login");
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data.message || "Something went wrong");
				return;
			}
			toast.error("Something went wrong");
		}
	}

	async function resendOTP() {
		if (!email) return;

		try {
			await axios.post(
				"/api/auth/forgot-password",
				{ email },
				{
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				},
			);
			toast.success("New OTP sent! Check your email.");
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 429) {
					toast.error(
						error.response?.data.message ||
							"Too many requests. Please try again later.",
					);
				} else {
					toast.error(error.response?.data.message || "Failed to resend OTP");
				}
			} else {
				toast.error("Failed to resend OTP");
			}
			console.error(error);
		}
	}

	if (!email) {
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
						Enter the 6-digit OTP sent to <strong>{email}</strong> and your new
						password
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
									name="token"
									render={({ field }) => (
										<FormItem>
											<FormLabel>6-Digit OTP</FormLabel>
											<FormControl>
												<Input
													type="text"
													placeholder="123456"
													className="h-12 text-base text-center tracking-widest"
													maxLength={6}
													autoComplete="one-time-code"
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

				<div className="flex flex-col items-center space-y-2">
					<button
						type="button"
						onClick={resendOTP}
						className="text-sm text-blue-600 hover:text-blue-800 underline"
					>
						Didn't receive the OTP? Resend
					</button>
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
