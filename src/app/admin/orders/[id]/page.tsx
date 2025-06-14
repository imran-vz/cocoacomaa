import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
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
import BackButton from "./back-button";
import CopyAddressButton from "./copy-address-button";
import CopyPhoneButton from "./copy-phone-button";
import NavButton from "./nav-button";

const getStatusColor = (status: string) => {
	switch (status) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "payment_pending":
			return "bg-orange-100 text-orange-800 border-orange-200";
		case "paid":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "confirmed":
			return "bg-green-100 text-green-800 border-green-200";
		case "preparing":
			return "bg-purple-100 text-purple-800 border-purple-200";
		case "ready":
			return "bg-emerald-100 text-emerald-800 border-emerald-200";
		case "completed":
			return "bg-gray-100 text-gray-800 border-gray-200";
		case "cancelled":
			return "bg-red-100 text-red-800 border-red-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

const getPaymentStatusColor = (status: string) => {
	switch (status) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "created":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "authorized":
			return "bg-green-100 text-green-800 border-green-200";
		case "captured":
			return "bg-emerald-100 text-emerald-800 border-emerald-200";
		case "failed":
			return "bg-red-100 text-red-800 border-red-200";
		case "refunded":
			return "bg-gray-100 text-gray-800 border-gray-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

const formatStatus = (status: string) => {
	return status
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export default async function AdminOrderDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const order = await db.query.orders.findFirst({
		where: eq(orders.id, id),
		with: {
			orderItems: {
				columns: {
					quantity: true,
					price: true,
				},
				with: {
					dessert: true,
				},
			},

			customer: {
				columns: {
					name: true,
					email: true,
					phone: true,
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
										{format(new Date(order.createdAt), "PPP 'at' p")}
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
											key={`${item.dessert.name}-${index}`}
											className="flex justify-between items-start gap-4"
										>
											<div className="flex-1 min-w-0">
												<h4 className="font-medium">{item.dessert.name}</h4>
												{item.dessert.description && (
													<p className="text-sm text-muted-foreground mt-1">
														{item.dessert.description}
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

									<div className="flex justify-between items-center font-semibold text-lg">
										<span>Total:</span>
										<span>{formatCurrency(Number(order.total))}</span>
									</div>
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
									<span className="text-sm capitalize">
										{order.customer.name}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm break-all">
										{order.customer.email}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">{order.customer.phone}</span>
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
												new Date(order.pickupDateTime),
												"EEEE, MMMM d, yyyy",
											)}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm">
											{format(new Date(order.pickupDateTime), "h:mm a")}
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
									<span className="text-sm flex-1">+91 98765 43210</span>
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
