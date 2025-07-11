"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { RazorpayOptions, RazorpayResponse } from "@/types/razorpay";

declare global {
	interface Window {
		Razorpay: new (
			options: RazorpayOptions,
		) => {
			open: () => void;
			on: (event: string, callback: (error: Error) => void) => void;
		};
	}
}

interface Workshop {
	id: number;
	title: string;
	description: string;
	amount: string;
	type: "online" | "offline";
	status: "active" | "inactive";
	imageUrl?: string | null;
	createdAt: Date;
}

const fetchWorkshops = async (): Promise<Workshop[]> => {
	const { data } = await axios.get("/api/workshops");
	return data.data;
};

export default function WorkshopsPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingWorkshopId, setProcessingWorkshopId] = useState<
		number | null
	>(null);

	const { data: workshops = [], isLoading } = useQuery({
		queryKey: ["workshops"],
		queryFn: fetchWorkshops,
	});

	// Filter to show only active workshops
	const activeWorkshops = workshops.filter((w) => w.status === "active");

	const handleRegister = async (workshop: Workshop) => {
		if (!session) {
			router.push("/login?redirect=/workshops");
			return;
		}

		setIsProcessing(true);
		setProcessingWorkshopId(workshop.id);

		try {
			// Create workshop order
			const response = await axios.post("/api/workshop-orders", {
				workshopId: workshop.id,
			});

			if (response.data.success) {
				// Initiate payment
				await handlePayment(
					response.data.orderId,
					response.data.razorpayOrderId,
					response.data.amount,
					workshop,
				);
			}
		} catch (error) {
			console.error("Error creating workshop order:", error);
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data.message || "Failed to register for workshop",
				);
			} else {
				toast.error("Failed to register for workshop");
			}
			setIsProcessing(false);
			setProcessingWorkshopId(null);
		}
	};

	const handlePayment = async (
		orderId: string,
		razorpayOrderId: string,
		amount: number,
		workshop: Workshop,
	) => {
		const options: RazorpayOptions = {
			key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
			amount: amount,
			currency: "INR",
			name: "Cocoa Comaa",
			description: `Workshop Registration: ${workshop.title}`,
			order_id: razorpayOrderId,
			image: "/logo.png",
			remember_customer: true,
			handler: async (response: RazorpayResponse) => {
				try {
					// Verify payment
					const verifyResponse = await axios.post(
						"/api/workshop-orders/verify",
						{
							razorpay_order_id: response.razorpay_order_id,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
							orderId,
						},
					);

					if (verifyResponse.data.success) {
						toast.success("Successfully registered for the workshop!");
						router.push("/my-workshops");
					} else {
						throw new Error("Payment verification failed");
					}
				} catch (error) {
					console.error("Payment verification error:", error);
					toast.error("Payment verification failed. Please contact support.");
				} finally {
					setIsProcessing(false);
					setProcessingWorkshopId(null);
				}
			},
			modal: {
				ondismiss: () => {
					setIsProcessing(false);
					setProcessingWorkshopId(null);
				},
			},
			prefill: {
				name: session?.user?.name || "",
				email: session?.user?.email || "",
				contact: "", // Add phone if available
			},
			theme: { color: "#551303" },
		};

		const razorpay = new window.Razorpay(options);
		razorpay.on("payment.failed", (error) => {
			console.error("Payment failed:", error);
			toast.error("Payment failed. Please try again.");
			setIsProcessing(false);
			setProcessingWorkshopId(null);
		});
		razorpay.open();
	};

	// Load Razorpay script
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		document.body.appendChild(script);

		return () => {
			if (document.body.contains(script)) {
				document.body.removeChild(script);
			}
		};
	}, []);

	if (isLoading) {
		return (
			<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
				<h1 className="text-2xl sm:text-3xl font-bold mb-6">Workshops</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="h-full overflow-hidden">
							<div className="aspect-video bg-gray-200 animate-pulse" />
							<CardHeader>
								<div className="h-6 bg-gray-200 rounded animate-pulse" />
								<div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="h-4 bg-gray-200 rounded animate-pulse" />
									<div className="h-4 bg-gray-200 rounded animate-pulse" />
									<div className="h-10 bg-gray-200 rounded animate-pulse" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto min-h-[calc(100svh-11rem)] py-4 sm:py-6 lg:py-8 px-4">
			{/* Loading Overlay */}
			{isProcessing && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-white rounded-lg p-6 sm:p-8 max-w-sm mx-4 text-center shadow-xl">
						<div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4" />
						<h3 className="text-lg sm:text-xl font-semibold mb-2">
							Processing Registration
						</h3>
						<p className="text-sm sm:text-base text-muted-foreground">
							Please wait while we process your workshop registration...
						</p>
					</div>
				</div>
			)}

			<h1 className="text-2xl sm:text-3xl font-bold mb-6">Workshops</h1>
			<p className="text-muted-foreground mb-8">
				Join our hands-on workshops to learn the art of dessert making from
				Maria and the team.
			</p>

			{activeWorkshops.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center">
						<h3 className="text-lg font-semibold mb-2">
							No workshops available
						</h3>
						<p className="text-muted-foreground">
							Check back soon for upcoming workshops.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{activeWorkshops.map((workshop) => (
						<Card
							key={workshop.id}
							className="h-full flex flex-col overflow-hidden"
						>
							{workshop.imageUrl && (
								<div className="relative aspect-video w-full">
									<Image
										src={workshop.imageUrl}
										alt={workshop.title}
										fill
										className="object-cover"
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									/>
								</div>
							)}
							<CardHeader>
								<div className="flex justify-between items-start gap-2">
									<CardTitle className="text-lg leading-tight">
										{workshop.title}
									</CardTitle>
									<Badge
										variant={
											workshop.type === "online" ? "default" : "secondary"
										}
									>
										{workshop.type}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col">
								<p className="text-muted-foreground mb-4 flex-1">
									{workshop.description}
								</p>
								<div className="mt-auto">
									<div className="flex items-center justify-between mb-4">
										<span className="text-2xl font-bold">
											{formatCurrency(Number(workshop.amount))}
										</span>
									</div>
									<Button
										onClick={() => handleRegister(workshop)}
										disabled={isProcessing}
										className="w-full"
									>
										{processingWorkshopId === workshop.id
											? "Processing..."
											: "Register Now"}
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
