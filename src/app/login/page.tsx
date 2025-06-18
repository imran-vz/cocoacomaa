"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const { data } = useSession();
	console.log(" :19 | LoginPage | data:", data);

	useEffect(() => {
		if (data?.user.id) {
			router.replace("/");
			return;
		}
	}, [data?.user?.id, router]);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		const formData = new FormData(event.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				toast.error("Invalid credentials");
				return;
			}

			router.push("/admin");
			router.refresh();
		} catch (error) {
			toast.error("Something went wrong");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-[calc(100svh-10rem)] flex items-center justify-center px-2 py-8 bg-background">
			<div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col justify-center space-y-6 mx-auto">
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
						<form onSubmit={onSubmit} className="space-y-6">
							<div className="grid gap-3">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
									className="h-12 text-base"
									autoComplete="email"
									aria-label="Email address"
								/>
							</div>
							<div className="grid gap-3">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
									<a
										href="/forgot-password"
										className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
									>
										Forgot your password?
									</a>
								</div>
								<div className="space-y-2">
									<div className="relative">
										<Input
											id="password"
											name="password"
											placeholder="********"
											type={showPassword ? "text" : "password"}
											required
											disabled={isLoading}
											className="h-12 text-base pr-10"
											autoComplete="current-password"
											aria-label="Password"
										/>
										<button
											type="button"
											className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
											onClick={() => setShowPassword((v) => !v)}
											aria-label={
												showPassword ? "Hide password" : "Show password"
											}
										>
											{showPassword ? <EyeOffIcon /> : <EyeIcon />}
										</button>
									</div>
								</div>
							</div>
							<div className="flex flex-col gap-3">
								<Button type="submit" className="w-full h-12 text-base">
									Login
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
				<div className="text-center text-sm text-muted-foreground mt-2">
					Don&apos;t have an account?{" "}
					<a href="/signup" className="underline underline-offset-4">
						Sign up
					</a>
				</div>
			</div>
		</div>
	);
}
