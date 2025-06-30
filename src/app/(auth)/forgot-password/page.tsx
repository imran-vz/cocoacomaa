"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
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
import { forgotPasswordSchema } from "@/lib/schema";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
	const router = useRouter();
	const { data } = useSession();

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: "" },
	});

	// Redirect if already logged in
	useEffect(() => {
		if (data?.user.id) {
			router.replace("/");
			return;
		}
	}, [data?.user?.id, router]);

	async function onSubmit(data: ForgotPasswordFormValues) {
		try {
			await axios.post("/api/auth/forgot-password", data, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			});

			toast.success("If this email exists, an OTP will be sent.");
			router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 429) {
					toast.error(
						error.response?.data.message ||
							"Too many requests. Please try again later.",
					);
				} else {
					toast.error(error.response?.data.message || "Something went wrong");
				}
				return;
			}
			toast.error("Something went wrong");
		}
	}

	return (
		<div className="min-h-[calc(100svh-10rem)] flex items-center justify-center px-2 py-8 bg-background">
			<div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col justify-center space-y-6 mx-auto">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Forgot your password?
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your email address and we'll send you an OTP to reset your
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

								<Button
									type="submit"
									className="w-full h-12 text-base"
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting ? "Sending OTP..." : "Send OTP"}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				<div className="flex items-center justify-center">
					<Link
						href="/login"
						className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to login
					</Link>
				</div>
			</div>
		</div>
	);
}
