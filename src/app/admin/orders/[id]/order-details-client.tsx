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
import { useState } from "react";

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
import { formatCurrency } from "@/lib/utils";
import BackButton from "./back-button";
import NavButton from "./nav-button";
import StatusUpdate from "./status-update";

type OrderData = {
	id: string;
	createdAt: Date;
	total: string;
	deliveryCost?: string | null;
	orderType: string;
	status: string;
	paymentStatus: string;
	razorpayPaymentId: string | null;
	pickupDateTime: Date | null;
	notes: string | null;
	orderItems: Array<{
		quantity: number;
		price: string;
		dessert: {
			name: string;
			description: string;
		} | null;
	}>;
	user: {
		name: string | null;
		email: string;
		phone: string | null;
	};
};

interface OrderDetailsClientProps {
	initialOrder: OrderData;
}

export default function OrderDetailsClient({
	initialOrder,
}: OrderDetailsClientProps) {
	const [order, setOrder] = useState<OrderData>(initialOrder);

	const handleStatusUpdate = (newStatus: string) => {
		setOrder((prev) => ({ ...prev, status: newStatus }));
	};

	return (
		<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<BackButton />
					<div className="min-w-0 flex-1">
						<h1 className="text-2xl sm:text-3xl font-bold truncate">
							Order Details
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
									{order.orderItems.map((item, index) => (
										<div
											key={`${item.dessert?.name}-${index}`}
											className="flex justify-between items-start gap-4"
										>
											<div className="flex-1 min-w-0">
												<h4 className="font-medium">{item.dessert?.name}</h4>
												{item.dessert?.description && (
													<p className="text-sm text-muted-foreground mt-1">
														{item.dessert?.description}
													</p>
												)}
												<p className="text-sm text-muted-foreground">
													{formatCurrency(Number(item.price))} × {item.quantity}
												</p>
											</div>
											<div className="text-right shrink-0">
												<p className="font-medium">
													{formatCurrency(Number(item.price) * item.quantity)}
												</p>
											</div>
										</div>
									))}

									<Separator />

									{/* Show breakdown for postal brownies with delivery cost */}
									{order.orderType === "postal-brownies" &&
									order.deliveryCost &&
									Number(order.deliveryCost) > 0 ? (
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span>Subtotal:</span>
												<span>
													{formatCurrency(
														Number(order.total) - Number(order.deliveryCost),
													)}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span>Delivery:</span>
												<span>
													{formatCurrency(Number(order.deliveryCost))}
												</span>
											</div>
											<div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
												<span>Total:</span>
												<span>{formatCurrency(Number(order.total))}</span>
											</div>
										</div>
									) : (
										<div className="flex justify-between items-center font-semibold text-lg">
											<span>Total:</span>
											<span>{formatCurrency(Number(order.total))}</span>
										</div>
									)}
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
						{/* Status Update Component */}
						<StatusUpdate
							orderId={order.id}
							currentStatus={order.status}
							onStatusUpdate={handleStatusUpdate}
						/>

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
									<span className="text-sm">{order.user.phone}</span>
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
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Amount:</span>
									<span className="text-sm font-medium">
										{formatCurrency(Number(order.total))}
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Action Buttons */}
						<div className="flex flex-col gap-3 justify-center">
							<NavButton />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
