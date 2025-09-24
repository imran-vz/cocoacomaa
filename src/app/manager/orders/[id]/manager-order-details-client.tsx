"use client";

import { TZDateMini } from "@date-fns/tz";
import { format } from "date-fns";
import {
	Calendar,
	Clock,
	CreditCard,
	Mail,
	MapPin,
	Package,
	Phone,
	User,
} from "lucide-react";

import CopyAddressButton from "@/app/(user)/order/[id]/copy-address-button";
import CopyPhoneButton from "@/app/(user)/order/[id]/copy-phone-button";
import {
	formatStatus,
	getPaymentStatusColor,
	getStatusColor,
} from "@/app/(user)/order/[id]/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ManagerBackButton from "./manager-back-button";
import ManagerNavButton from "./manager-nav-button";

type OrderData = {
	id: string;
	createdAt: Date;
	orderType: string;
	status: string;
	paymentStatus: string;
	razorpayPaymentId: string | null;
	pickupDateTime: Date | null;
	notes: string | null;
	orderItems: Array<{
		quantity: number;
		itemType: string;
		postalCombo: {
			name: string;
		} | null;
		dessert: {
			name: string;
			category: string;
		} | null;
	}>;
	user: {
		name: string | null;
		email: string;
		phone: string | null;
	};
};

interface ManagerOrderDetailsClientProps {
	initialOrder: OrderData;
}

// Helper function to check if order contains special desserts
function hasSpecialDesserts(
	orderItems: {
		itemType: string;
		dessert: { category: string } | null;
	}[],
): boolean {
	return orderItems.some(
		(item) =>
			item.itemType === "dessert" && item.dessert?.category === "special",
	);
}

export default function ManagerOrderDetailsClient({
	initialOrder,
}: ManagerOrderDetailsClientProps) {
	const order = initialOrder;

	return (
		<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<ManagerBackButton />
					<div className="min-w-0 flex-1">
						<h1 className="text-2xl sm:text-3xl font-bold truncate">
							Order Details (Read-Only)
						</h1>
						<p className="text-muted-foreground text-sm sm:text-base">
							Order ID: {order.id}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Order Status & Info */}
					<div className="lg:col-span-2 space-y-6">
						{/* Status Card */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Package className="h-5 w-5" />
									Order Status
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center gap-3">
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium">Status:</span>
										<Badge className={getStatusColor(order.status)}>
											{formatStatus(order.status)}
										</Badge>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium">Payment:</span>
										<Badge
											className={getPaymentStatusColor(order.paymentStatus)}
										>
											{formatStatus(order.paymentStatus)}
										</Badge>
									</div>
								</div>

								<div className="text-sm text-muted-foreground">
									<p>
										Order placed on{" "}
										{format(
											new TZDateMini(order.createdAt, "Asia/Kolkata"),
											"PPP 'at' p",
										)}
									</p>
									{order.razorpayPaymentId && (
										<p>Payment ID: {order.razorpayPaymentId}</p>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Order Items */}
						<Card>
							<CardHeader>
								<CardTitle>Order Items</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{order.orderType === "postal-brownies"
										? order.orderItems.map((item, index) => {
												return (
													<div
														key={`${item.postalCombo?.name}-${index}`}
														className="flex justify-between items-start gap-4"
													>
														<div className="flex-1 min-w-0">
															<h4 className="font-medium">
																{item.postalCombo?.name}
															</h4>
															<p className="text-sm text-muted-foreground">
																Quantity: {item.quantity}
															</p>
														</div>
													</div>
												);
											})
										: order.orderItems.map((item, index) => (
												<div
													key={`${item.dessert?.name}-${index}`}
													className="flex justify-between items-start gap-4"
												>
													<div className="flex-1 min-w-0">
														<h4 className="font-medium">
															{item.dessert?.name}
														</h4>
														<p className="text-sm text-muted-foreground">
															Quantity: {item.quantity}
														</p>
													</div>
												</div>
											))}

								</div>
							</CardContent>
						</Card>

						{/* Notes */}
						{order.notes && (
							<Card>
								<CardHeader>
									<CardTitle>Order Notes</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm">{order.notes}</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Read-only notice */}
						<Card>
							<CardHeader>
								<CardTitle className="text-sm">Manager Access</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									You are viewing this order in read-only mode. Status updates
									are not available for managers.
								</p>
							</CardContent>
						</Card>

						{/* Customer Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									Customer Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm capitalize">{order.user.name}</span>
								</div>
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm break-all">{order.user.email}</span>
								</div>
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">
										{order.user.phone || "Not provided"}
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Pickup Information */}
						{order.pickupDateTime && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calendar className="h-5 w-5" />
										Pickup Details
										{hasSpecialDesserts(order.orderItems) && (
											<span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
												Special
											</span>
										)}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm">
											{format(
												new TZDateMini(order.pickupDateTime, "Asia/Kolkata"),
												"EEEE, MMMM d, yyyy",
											)}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm">
											{format(
												new TZDateMini(order.pickupDateTime, "Asia/Kolkata"),
												"h:mm a",
											)}
										</span>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Pickup Address & Contact */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MapPin className="h-5 w-5" />
									Pickup Location
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-start gap-2">
									<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
									<div className="text-sm flex-1">
										<p className="font-medium">Cocoa Comaa</p>
										<p className="text-muted-foreground">
											Akshaya Gold Apartment, <br /> Pipe Line Rd, VGS Layout,
											<br />
											Ejipura, Bengaluru - 560047{" "}
										</p>
									</div>
									<CopyAddressButton />
								</div>
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm flex-1">
										{process.env.NEXT_PUBLIC_BUSINESS_PHONE}
									</span>
									<CopyPhoneButton />
								</div>
							</CardContent>
						</Card>

						{/* Payment Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="h-5 w-5" />
									Payment Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Status:</span>
									<Badge className={getPaymentStatusColor(order.paymentStatus)}>
										{formatStatus(order.paymentStatus)}
									</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Action Buttons */}
						<div className="flex flex-col gap-3 justify-center">
							<ManagerNavButton />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
