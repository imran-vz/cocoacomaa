"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function RegisterPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showPhoneDialog, setShowPhoneDialog] = useState(false);
	const [phoneDialogAcknowledged, setPhoneDialogAcknowledged] = useState(false);
	const { data } = useSession();

	useEffect(() => {
		if (data?.user.id) {
			router.replace("/");
			return;
		}
	}, [data?.user?.id, router]);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!phoneDialogAcknowledged) {
			setShowPhoneDialog(true);
			return;
		}
		setIsLoading(true);

		const formData = new FormData(event.currentTarget);
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const phone = formData.get("phone") as string;

		try {
			await axios.post(
				"/api/register",
				{
					name,
					email,
					password,
					phone,
				},
				{
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				},
			);

			toast.success("Registration successful! Please log in.");
			router.push("/login");
			router.refresh();
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				if (error.response?.data.errors) {
					console.log(
						" :67 | onSubmit | error.response?.data.errors:",
						error.response?.data.errors,
					);

					const errors = Object.keys(error.response?.data.errors).map((key) =>
						error.response?.data.errors[key]?.join("\n"),
					);
					if (errors.length > 0) {
						toast.error(
							<div>
								<ul className="list-disc list-inside space-y-1">
									{errors.map((error) => (
										<li key={error}>{error}</li>
									))}
								</ul>
							</div>,
						);
					} else {
						toast.error(error.response?.data.message || "Something went wrong");
					}
				} else {
					toast.error(error.response?.data.message || "Something went wrong");
				}
			} else {
				toast.error("Something went wrong");
			}
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-[calc(100svh-10rem)] flex items-center justify-center px-2 py-8 bg-background">
			<div className="w-full max-w-sm px-4 sm:px-0 sm:max-w-sm md:max-w-md flex flex-col justify-center space-y-6 mx-auto">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Create an account
					</h1>
					<p className="text-sm text-muted-foreground">
						Sign up to order desserts and more
					</p>
				</div>
				<Card className="shadow-md border border-gray-200">
					<CardContent className="pt-6">
						<form
							onSubmit={onSubmit}
							className="space-y-6"
							aria-label="Sign up form"
						>
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									name="name"
									type="text"
									placeholder="Your name"
									required
									disabled={isLoading}
									className="h-12 text-base"
									autoComplete="name"
									aria-label="Full name"
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
									className="h-12 text-base"
									autoComplete="email"
									aria-label="Email address"
								/>
							</div>
							<div className="space-y-2 hidden">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									name="username"
									type="text"
									placeholder="Your username"
									disabled={isLoading}
									hidden
									className="hidden"
									autoComplete="username"
									aria-label="Username"
								/>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="phone">Phone Number</Label>
									<AlertDialog
										open={showPhoneDialog}
										onOpenChange={setShowPhoneDialog}
									>
										<AlertDialogTrigger asChild>
											<button
												type="button"
												aria-label="Why do we need your phone number?"
												className="text-blue-500 hover:text-blue-700 focus:outline-none"
											>
												<Info className="h-4 w-4" />
											</button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogTitle>
												Why do we need your phone number?
											</AlertDialogTitle>
											<AlertDialogDescription>
												Please enter a valid phone number. We'll use this to get
												in touch with you for any order updates or
												delivery-related queries.
											</AlertDialogDescription>
											<AlertDialogAction
												onClick={() => {
													setShowPhoneDialog(false);
													setPhoneDialogAcknowledged(true);
													setTimeout(() => {
														const form = document.querySelector("form");
														if (form) (form as HTMLFormElement).requestSubmit();
													}, 0);
												}}
											>
												Got it
											</AlertDialogAction>
										</AlertDialogContent>
									</AlertDialog>
								</div>
								<Input
									id="phone"
									name="phone"
									type="tel"
									placeholder="Your phone number"
									required
									disabled={isLoading}
									className="h-12 text-base"
									pattern="[0-9+\-\s()]{10,}"
									autoComplete="tel"
									aria-label="Phone number"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Input
										id="password"
										name="password"
										placeholder="********"
										type={showPassword ? "text" : "password"}
										required
										disabled={isLoading}
										className="h-12 text-base pr-10"
										autoComplete="new-password"
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

							<Button
								className="w-full h-12 text-base"
								type="submit"
								disabled={isLoading}
								aria-label="Sign up"
							>
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
