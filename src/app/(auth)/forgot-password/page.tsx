"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema } from "@/lib/schema";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const form = useForm({
		defaultValues: { email: "" },
		validators: {
			onSubmit: forgotPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const result = await authClient.requestPasswordReset({
					email: value.email,
					redirectTo: "/reset-password",
				});

				if (result.error) {
					toast.error(result.error.message || "Something went wrong");
					return;
				}

				toast.success(
					"If this email exists, a password reset link will be sent to your inbox.",
				);
				// Don't redirect, let user know to check their email
			} catch (error: unknown) {
				console.error("Forgot password error:", error);
				toast.error("Something went wrong");
			}
		},
	});

	// Redirect if already logged in
	useEffect(() => {
		if (session?.user?.id) {
			router.replace("/");
			return;
		}
	}, [session?.user?.id, router]);

	return (
		<div className="min-h-[calc(100svh-10rem)] flex items-center justify-center px-2 py-8 bg-background">
			<div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col justify-center space-y-6 mx-auto">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Forgot your password?
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your email address and we'll send you a link to reset your
						password
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
												placeholder="m@example.com"
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

							<form.Subscribe
								selector={(state) => state.isSubmitting}
								// biome-ignore lint/correctness/noChildrenProp: TanStack Form API
								children={(isSubmitting) => (
									<Button
										type="submit"
										className="w-full h-12 text-base"
										disabled={isSubmitting}
									>
										{isSubmitting ? "Sending reset link..." : "Send reset link"}
									</Button>
								)}
							/>
						</form>
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
