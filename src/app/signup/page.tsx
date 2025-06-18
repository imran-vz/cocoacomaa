"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		const formData = new FormData(event.currentTarget);
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const res = await fetch("/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || "Registration failed");
			}

			toast.success("Registration successful! Please log in.");
			router.push("/login");
			router.refresh();
		} catch (error: unknown) {
			const message =
				typeof error === "object" && error && "message" in error
					? (error as { message?: string }).message
					: undefined;
			toast.error(message || "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="container relative min-h-[calc(100svh-10rem)] place-items-center grid lg:max-w-none lg:px-0">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Create an account
					</h1>
					<p className="text-sm text-muted-foreground">
						Sign up to order desserts and more
					</p>
				</div>
				<Card>
					<CardContent className="pt-6">
						<form onSubmit={onSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									name="name"
									type="text"
									placeholder="Your name"
									required
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="name@example.com"
									required
									disabled={isLoading}
								/>
							</div>
							<div className="relative">
								<Input
									id="password"
									name="password"
									placeholder="********"
									type={showPassword ? "text" : "password"}
									required
									disabled={isLoading}
								/>
								<button
									type="button"
									className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? <EyeOffIcon /> : <EyeIcon />}
								</button>
							</div>
							<Button className="w-full" type="submit" disabled={isLoading}>
								{isLoading && (
									<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
								)}
								Sign Up
							</Button>
						</form>
					</CardContent>
				</Card>
				<div className="text-center text-sm text-muted-foreground mt-2">
					Already have an account?{" "}
					<a href="/login" className="underline">
						Sign in
					</a>
				</div>
			</div>
		</div>
	);
}
