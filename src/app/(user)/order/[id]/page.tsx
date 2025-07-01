import { TZDateMini } from "@date-fns/tz";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import {
	AlertCircle,
	Calendar,
	Clock,
	CreditCard,
	Mail,
	MapPin,
	Package,
	Phone,
	User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import BackButton from "./back-button";
import CopyAddressButton from "./copy-address-button";
import CopyPhoneButton from "./copy-phone-button";
import NavButton from "./nav-button";
import RetryPaymentCard from "./retry-payment-card";
import { formatStatus, getPaymentStatusColor, getStatusColor } from "./utils";

export default async function AdminOrderDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const order = await db.query.orders.findFirst({
		where: eq(orders.id, id),
		columns: {
			id: true,
			status: true,
			paymentStatus: true,
			createdAt: true,
			razorpayPaymentId: true,
			razorpayOrderId: true,
			total: true,
			deliveryCost: true,
			notes: true,
			pickupDateTime: true,
			orderType: true,
		},
		with: {
			orderItems: {
				columns: {
					quantity: true,
					price: true,
					itemType: true,
					itemName: true,
					dessertId: true,
					postalComboId: true,
				},
				with: {
					dessert: true,
					postalCombo: true,
				},
			},
			user: {
				columns: {
					name: true,
					email: true,
					phone: true,
				},
			},
			address: {
				columns: {
					addressLine1: true,
					addressLine2: true,
					city: true,
					state: true,
					zip: true,
				},
			},
		},
	});

	if (!order) {
		return (
			<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
				<div className="max-w-4xl mx-auto">
					<Card>
						<CardContent className="py-8 text-center">
							<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
							<h2 className="text-xl font-bold mb-2">Order Not Found</h2>
							<p className="text-muted-foreground mb-6">
								{
									"The order you're looking for doesn't exist or has been removed."
								}
							</p>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<NavButton />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

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

						{/* Payment Retry Section */}
						{order.status === "payment_pending" && (
							<RetryPaymentCard order={order} />
						)}

						{/* Order Items */}
						<Card>
							<CardHeader>
								<CardTitle>Order Items</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{order.orderItems.map((item) => {
										// Get item details based on type
										const itemDetails =
											item.itemType === "dessert"
												? item.dessert
												: item.postalCombo;

										// Use stored name as fallback if item is deleted
										const itemName = itemDetails?.name || item.itemName;
										const itemDescription = itemDetails?.description;

										// Create unique key based on item properties
										const itemId =
											item.itemType === "dessert"
												? `dessert-${item.dessertId}`
												: `postal-${item.postalComboId}`;
										const uniqueKey = `${itemId}-${item.quantity}-${item.price}`;

										return (
											<div
												key={uniqueKey}
												className="flex justify-between items-start gap-4"
											>
												<div className="flex-1 min-w-0">
													<h4 className="font-medium">{itemName}</h4>
													{itemDescription && (
														<p className="text-sm text-muted-foreground mt-1">
															{itemDescription}
														</p>
													)}
													<p className="text-sm text-muted-foreground">
														{formatCurrency(Number(item.price))} ×{" "}
														{item.quantity}
													</p>
												</div>
												<div className="text-right shrink-0">
													<p className="font-medium">
														{formatCurrency(Number(item.price) * item.quantity)}
													</p>
												</div>
											</div>
										);
									})}

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

						{/* Pickup Information - Only for cake orders */}
						{order.orderType !== "postal-brownies" && order.pickupDateTime && (
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

						{/* Delivery Address - Only for postal brownies */}
						{order.orderType === "postal-brownies" && order.address && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Package className="h-5 w-5" />
										Delivery Address
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-start gap-2">
										<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="text-sm flex-1">
											<p className="font-medium">
												{order.address.addressLine1}
											</p>
											{order.address.addressLine2 && (
												<p className="text-muted-foreground">
													{order.address.addressLine2}
												</p>
											)}
											<p className="text-muted-foreground">
												{order.address.city}, {order.address.state}{" "}
												{order.address.zip}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Pickup Address & Contact - Only for cake orders */}
						{order.orderType !== "postal-brownies" && (
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
						)}

						{/* Business Contact - Only for postal brownies */}
						{order.orderType === "postal-brownies" && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Phone className="h-5 w-5" />
										Contact Us
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm flex-1">
											{process.env.NEXT_PUBLIC_BUSINESS_PHONE}
										</span>
										<CopyPhoneButton />
									</div>
									<p className="text-xs text-muted-foreground">
										Call us if you have any questions about your delivery
									</p>
								</CardContent>
							</Card>
						)}

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
						<div className="space-y-3">
							<NavButton />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
