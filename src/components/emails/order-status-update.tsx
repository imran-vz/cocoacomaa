import { TZDateMini } from "@date-fns/tz";
import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";
import { format } from "date-fns";
import * as React from "react";

interface OrderStatusUpdateEmailProps {
	orderDetails: {
		id: string;
		status: string;
		total: string;
		createdAt: Date;
		notes?: string | null;
		pickupDateTime?: Date | null;
		orderType: string;
		user: {
			name: string | null;
			email: string;
		};
		address?: {
			addressLine1: string;
			addressLine2?: string | null;
			city: string;
			state: string;
			zip: string;
		} | null;
	};
}

function getStatusInfo(status: string) {
	const statusMap: Record<
		string,
		{ label: string; emoji: string; description: string; color: string }
	> = {
		pending: {
			label: "Order Received",
			emoji: "📝",
			description: "We've received your order and it's being processed.",
			color: "#f59e0b", // amber
		},
		payment_pending: {
			label: "Payment Pending",
			emoji: "💳",
			description: "Waiting for payment to be completed.",
			color: "#f59e0b", // amber
		},
		paid: {
			label: "Payment Confirmed",
			emoji: "✅",
			description: "Your payment has been confirmed successfully.",
			color: "#10b981", // emerald
		},
		confirmed: {
			label: "Order Confirmed",
			emoji: "🎯",
			description: "Your order has been confirmed and will be prepared soon.",
			color: "#3b82f6", // blue
		},
		preparing: {
			label: "Preparing Your Order",
			emoji: "👩‍🍳",
			description: "Our team is carefully preparing your delicious treats.",
			color: "#8b5cf6", // violet
		},
		ready: {
			label: "Ready for Pickup",
			emoji: "🎉",
			description: "Your order is ready! Come pick it up at your convenience.",
			color: "#10b981", // emerald
		},
		completed: {
			label: "Order Completed",
			emoji: "✨",
			description: "Your order has been successfully completed. Thank you!",
			color: "#6b7280", // gray
		},
		cancelled: {
			label: "Order Cancelled",
			emoji: "❌",
			description:
				"Your order has been cancelled. If you have any questions, please contact us.",
			color: "#ef4444", // red
		},
	};

	return (
		statusMap[status] || {
			label: "Status Updated",
			emoji: "📋",
			description: "Your order status has been updated.",
			color: "#6b7280",
		}
	);
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default function OrderStatusUpdateEmail({
	orderDetails,
}: OrderStatusUpdateEmailProps) {
	const customerName = orderDetails.user.name || "Customer";
	const statusInfo = getStatusInfo(orderDetails.status);
	const isPostalOrder = orderDetails.orderType === "postal-brownies";

	const pickupInfo = orderDetails.pickupDateTime
		? format(
				new TZDateMini(orderDetails.pickupDateTime, "Asia/Kolkata"),
				"PPP 'at' p",
			)
		: null;

	return (
		<Html>
			<Head />
			<Preview>
				{statusInfo.emoji} Order Update #{orderDetails.id} - {statusInfo.label}
			</Preview>
			<Tailwind>
				<Body className="bg-gray-50 font-sans">
					<Container className="mx-auto py-8 px-4 max-w-2xl bg-white">
						{/* Header */}
						<Section className="text-center mb-8">
							<Heading className="text-3xl font-bold text-amber-800 mb-2">
								Cocoa Comaa
							</Heading>
							<Text className="text-gray-600 text-lg mb-0">
								Desserts & Delights
							</Text>
						</Section>

						{/* Status Update Banner */}
						<Section
							className="border-2 rounded-lg p-6 text-center mb-8"
							style={{
								backgroundColor: `${statusInfo.color}15`,
								borderColor: statusInfo.color,
							}}
						>
							<Text className="text-4xl mb-2">{statusInfo.emoji}</Text>
							<Heading
								className="text-2xl font-bold mb-2"
								style={{ color: statusInfo.color }}
							>
								{statusInfo.label}
							</Heading>
							<Text className="text-gray-700 text-lg mb-0">
								Hi {customerName}, your order status has been updated!
							</Text>
						</Section>

						{/* Status Description */}
						<Section className="mb-8">
							<div className="bg-gray-50 p-4 rounded-lg">
								<Text className="text-gray-700 mb-0 text-center">
									{statusInfo.description}
								</Text>
							</div>
						</Section>

						{/* Order Details */}
						<Section className="mb-8">
							<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
								Order Information
							</Heading>
							<div className="bg-gray-50 p-4 rounded-lg">
								<Text className="font-semibold text-gray-700 mb-2">
									Order ID:{" "}
									<span className="font-normal">{orderDetails.id}</span>
								</Text>
								<Text className="font-semibold text-gray-700 mb-2">
									Total Amount:{" "}
									<span className="font-normal">
										{formatCurrency(Number(orderDetails.total))}
									</span>
								</Text>
								<Text className="font-semibold text-gray-700 mb-0">
									Order Type:{" "}
									<span className="font-normal">
										{isPostalOrder ? "Postal Brownies" : "Cake Orders"}
									</span>
								</Text>
							</div>
						</Section>

						{/* Next Steps */}
						{orderDetails.status === "ready" && !isPostalOrder && (
							<Section className="mb-8">
								<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
									Ready for Pickup!
								</Heading>
								<div className="bg-green-50 p-4 rounded-lg border border-green-200">
									<Text className="text-green-800 mb-2 font-semibold">
										🎉 Your order is ready for pickup!
									</Text>
									<Text className="text-green-700 mb-2">
										<strong>Pickup Location:</strong>
										<br />
										Cocoa Comaa
										<br />
										Akshaya Gold Apartment,
										<br />
										Pipe Line Rd, VGS Layout,
										<br />
										Ejipura, Bengaluru - 560047
									</Text>
									<Text className="text-green-700 mb-2">
										<strong>Pickup Time:</strong> {pickupInfo || "As scheduled"}
									</Text>
									<Text className="text-green-700 mb-0">
										<strong>Contact:</strong>{" "}
										{process.env.NEXT_PUBLIC_BUSINESS_PHONE}
									</Text>
								</div>
							</Section>
						)}

						{orderDetails.status === "preparing" && (
							<Section className="mb-8">
								<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
									In the Kitchen
								</Heading>
								<div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
									<Text className="text-purple-800 mb-2 font-semibold">
										👩‍🍳 Your treats are being prepared with love!
									</Text>
									<Text className="text-purple-700 mb-0">
										Our skilled bakers are carefully crafting your order. We'll
										notify you as soon as it's ready for pickup.
									</Text>
								</div>
							</Section>
						)}

						{orderDetails.status === "completed" && (
							<Section className="mb-8">
								<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
									Thank You!
								</Heading>
								<div className="bg-gray-50 p-4 rounded-lg">
									<Text className="text-gray-700 mb-2">
										✨ We hope you enjoyed your delicious treats from Cocoa
										Comaa!
									</Text>
									<Text className="text-gray-700 mb-0">
										Your feedback means the world to us. Follow us on Instagram
										@cocoa_comaa to share your experience!
									</Text>
								</div>
							</Section>
						)}

						{orderDetails.status === "completed" && (
							<Section className="mb-8">
								<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
									Storage Instructions
								</Heading>
								<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
									<Text className="text-blue-800 mb-2 font-semibold">
										🍫 Keep your brownies fresh and delicious:
									</Text>
									<Text className="text-blue-700 mb-2">
										• Store brownies in an airtight container at room
										temperature for up to 5 days.
									</Text>
									<Text className="text-blue-700 mb-2">
										• For longer storage, refrigerate them in an airtight
										container for up to 20 days.
									</Text>
									<Text className="text-blue-700 mb-0">
										• Reheat slightly before serving for the best taste and
										texture.
									</Text>
								</div>
							</Section>
						)}

						{/* Contact Information */}
						<Section className="mb-8">
							<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
								Questions?
							</Heading>
							<div className="bg-gray-50 p-4 rounded-lg">
								<Text className="text-gray-700 mb-2">
									📞 Call us: {process.env.NEXT_PUBLIC_BUSINESS_PHONE}
								</Text>
								<Text className="text-gray-700 mb-2">
									📧 Email us:{" "}
									<Link
										href="mailto:contact@cocoacomaa.com"
										className="text-blue-600 no-underline"
									>
										contact@cocoacomaa.com
									</Link>
								</Text>
								<Text className="text-gray-700 mb-2">
									💬 WhatsApp:{" "}
									<Link
										href="https://wa.me/918431873579"
										className="text-green-600 no-underline"
									>
										Chat with us
									</Link>
								</Text>
								<Text className="text-gray-700 mb-0">
									⏰ Available: Wednesday to Sunday, 9 AM - 6 PM IST
								</Text>
							</div>
						</Section>

						{/* Footer */}
						<Section className="text-center pt-6 border-t border-gray-200">
							<Text className="text-amber-800 text-lg font-semibold mb-2">
								Thank you for choosing Cocoa Comaa! 🍰
							</Text>
							<Text className="text-gray-600 text-sm mb-4">
								Follow us on{" "}
								<Link
									href="https://www.instagram.com/cocoa_comaa/"
									className="text-pink-600 no-underline"
								>
									Instagram @cocoa_comaa
								</Link>
							</Text>
						</Section>

						<Hr className="border-gray-300 my-6" />
						<Text className="text-center text-gray-500 text-xs mb-0">
							© 2024 Cocoa Comaa. All rights reserved.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}
