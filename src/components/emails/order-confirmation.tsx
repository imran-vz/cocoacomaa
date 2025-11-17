import {
	Body,
	Column,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Row,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";
// biome-ignore lint/correctness/noUnusedImports: React is used for email components
import * as React from "react";
import { formatDateTime } from "@/lib/format-timestamp";

interface OrderItem {
	itemName: string;
	quantity: number;
	price: string;
}

interface OrderConfirmationEmailProps {
	orderDetails: {
		id: string;
		total: string;
		deliveryCost?: string | null;
		createdAt: Date;
		notes?: string | null;
		pickupDateTime?: Date | null;
		orderType: string;
		orderItems: OrderItem[];
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

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default function OrderConfirmationEmail({
	orderDetails,
}: OrderConfirmationEmailProps) {
	const customerName = orderDetails.user.name || "Customer";
	const orderDate = formatDateTime(orderDetails.createdAt);

	const pickupInfo = orderDetails.pickupDateTime
		? formatDateTime(orderDetails.pickupDateTime)
		: null;

	const isPostalOrder = orderDetails.orderType === "postal-brownies";
	const deliveryInfo = orderDetails.address
		? `${orderDetails.address.addressLine1}${
				orderDetails.address.addressLine2
					? `, ${orderDetails.address.addressLine2}`
					: ""
			}, ${orderDetails.address.city}, ${orderDetails.address.state} - ${
				orderDetails.address.zip
			}`
		: null;

	const totalAmount = Number(orderDetails.total);
	const deliveryCostAmount = Number(orderDetails.deliveryCost || 0);
	const subtotalAmount = totalAmount - deliveryCostAmount;

	return (
		<Html>
			<Head />
			<Preview>
				🎉 Order Confirmed #{orderDetails.id.slice(-8).toUpperCase()} - Thank
				you for choosing Cocoa Comaa!
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

						{/* Confirmation Banner */}
						<Section className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center mb-8">
							<Heading className="text-2xl font-bold text-green-700 mb-2">
								🎉 Order Confirmed!
							</Heading>
							<Text className="text-gray-700 text-lg mb-0">
								Thank you for your order, {customerName}!
							</Text>
						</Section>

						{/* Order Details */}
						<Section className="mb-8">
							<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
								Order Details
							</Heading>
							<div className="bg-gray-50 p-4 rounded-lg">
								<Row className="mb-2">
									<Column>
										<Text className="font-semibold text-gray-700 mb-1">
											Order ID:
										</Text>
									</Column>
									<Column>
										<Text className="text-gray-600 mb-1">
											{orderDetails.id.slice(-8).toUpperCase()}
										</Text>
									</Column>
								</Row>
								<Row className="mb-2">
									<Column>
										<Text className="font-semibold text-gray-700 mb-1">
											Order Date:
										</Text>
									</Column>
									<Column>
										<Text className="text-gray-600 mb-1">{orderDate}</Text>
									</Column>
								</Row>
								{pickupInfo && !isPostalOrder && (
									<Row className="mb-2">
										<Column>
											<Text className="font-semibold text-gray-700 mb-1">
												Pickup Date:
											</Text>
										</Column>
										<Column>
											<Text className="text-gray-600 mb-1">{pickupInfo}</Text>
										</Column>
									</Row>
								)}
								{deliveryInfo && isPostalOrder && (
									<Row>
										<Column>
											<Text className="font-semibold text-gray-700 mb-1">
												Delivery Address:
											</Text>
										</Column>
										<Column>
											<Text className="text-gray-600 mb-1 leading-relaxed">
												{deliveryInfo}
											</Text>
										</Column>
									</Row>
								)}
							</div>
						</Section>

						{/* Order Items */}
						<Section className="mb-8">
							<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
								Order Items
							</Heading>
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
								{/* Table Header */}
								<div className="bg-amber-800 text-white">
									<Row className="p-3">
										<Column className="font-semibold">Item</Column>
										<Column className="font-semibold text-center w-16">
											Qty
										</Column>
										<Column className="font-semibold text-right w-24">
											Price
										</Column>
										<Column className="font-semibold text-right w-24">
											Total
										</Column>
									</Row>
								</div>
								{/* Table Body */}
								{orderDetails.orderItems.map((item, index) => (
									<div
										key={`${item.itemName}-${item.quantity}-${item.price}-${index}`}
										className={
											index === orderDetails.orderItems.length - 1
												? ""
												: "border-b border-gray-100"
										}
									>
										<Row className="p-3">
											<Column>
												<Text className="font-medium text-gray-800 mb-0">
													{item.itemName}
												</Text>
											</Column>
											<Column className="text-center w-16">
												<Text className="text-gray-600 mb-0">
													{item.quantity}
												</Text>
											</Column>
											<Column className="text-right w-24">
												<Text className="text-gray-600 mb-0">
													{formatCurrency(Number(item.price))}
												</Text>
											</Column>
											<Column className="text-right w-24">
												<Text className="font-medium text-gray-800 mb-0">
													{formatCurrency(Number(item.price) * item.quantity)}
												</Text>
											</Column>
										</Row>
									</div>
								))}
								{/* Total Rows */}
								<div className="bg-gray-50">
									{/* Subtotal Row */}
									<Row className="p-3">
										<Column className="text-right" colSpan={3}>
											<Text className="text-base font-medium text-gray-700 mb-0">
												Subtotal:
											</Text>
										</Column>
										<Column className="text-right w-24">
											<Text className="text-base font-medium text-gray-800 mb-0">
												{formatCurrency(subtotalAmount)}
											</Text>
										</Column>
									</Row>

									{/* Delivery Cost Row (only for postal brownies) */}
									{isPostalOrder && deliveryCostAmount > 0 && (
										<Row className="p-3 border-t border-gray-200">
											<Column className="text-right" colSpan={3}>
												<Text className="text-base font-medium text-gray-700 mb-0">
													Delivery:
												</Text>
											</Column>
											<Column className="text-right w-24">
												<Text className="text-base font-medium text-gray-800 mb-0">
													{formatCurrency(deliveryCostAmount)}
												</Text>
											</Column>
										</Row>
									)}

									{/* Grand Total Row */}
									<Row className="p-4 border-t-2 border-amber-800">
										<Column className="text-right" colSpan={3}>
											<Text className="text-lg font-semibold text-gray-800 mb-0">
												Grand Total:
											</Text>
										</Column>
										<Column className="text-right w-24">
											<Text className="text-xl font-bold text-amber-800 mb-0">
												{formatCurrency(totalAmount)}
											</Text>
										</Column>
									</Row>
								</div>
							</div>
						</Section>

						{/* Notes Section */}
						{orderDetails.notes && (
							<Section className="mb-8">
								<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
									{isPostalOrder ? "Delivery Instructions" : "Special Message"}
								</Heading>
								<div className="bg-gray-50 p-4 rounded-lg">
									<Text className="text-gray-700 italic mb-0">
										"{orderDetails.notes}"
									</Text>
								</div>
							</Section>
						)}

						{/* Pickup Information (for non-postal orders) */}
						{!isPostalOrder && (
							<Section className="mb-8">
								<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
									Pickup Information
								</Heading>
								<div className="bg-gray-50 p-4 rounded-lg">
									<Text className="font-semibold text-gray-800 mb-2">
										Cocoa Comaa
									</Text>
									<Text className="text-gray-700 mb-2 leading-relaxed">
										Akshaya Gold Apartment,
										<br />
										Pipe Line Rd, VGS Layout,
										<br />
										Ejipura, Bengaluru - 560047
									</Text>
									<Text className="text-gray-700 mb-0">
										📞 {process.env.NEXT_PUBLIC_BUSINESS_PHONE}
									</Text>
								</div>
							</Section>
						)}

						{/* Postal Brownies Care Instructions */}
						{isPostalOrder && (
							<Section className="mb-8">
								<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
									📦 Postal Brownies Care Instructions
								</Heading>
								<div className="bg-linear-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
									<Text className="text-gray-700 mb-2 font-medium">
										🍫 Upon Delivery:
									</Text>
									<Text className="text-gray-700 mb-2 text-sm">
										• Inspect your brownies immediately upon delivery
									</Text>
									<Text className="text-gray-700 mb-2 text-sm">
										• Store in a cool, dry place (room temperature is perfect)
									</Text>
									<Text className="text-gray-700 mb-3 text-sm">
										• Refrigerate only if your area is very humid
									</Text>
									<Text className="text-gray-700 mb-2 font-medium">
										🥛 Best Enjoyed:
									</Text>
									<Text className="text-gray-700 mb-0 text-sm">
										• Pair with a glass of cold milk or your favorite hot
										beverage for the ultimate experience!
									</Text>
								</div>
							</Section>
						)}

						{/* What's Next */}
						<Section className="mb-8">
							<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
								What's Next?
							</Heading>
							<div className="bg-gray-50 p-4 rounded-lg">
								{isPostalOrder ? (
									<>
										<Text className="text-gray-700 mb-2">
											🍫 Your fresh brownies will be baked to perfection and
											carefully packaged
										</Text>
										<Text className="text-gray-700 mb-2">
											📦 We use special insulated packaging to ensure freshness
											during transit
										</Text>
										<Text className="text-gray-700 mb-2">
											📱 You'll receive tracking information via SMS/WhatsApp
											once dispatched
										</Text>
										<Text className="text-gray-700 mb-2">
											🚛 Expected delivery: 2-3 business days (Monday to
											Saturday)
										</Text>
										<Text className="text-gray-700 mb-0">
											❄️ Best consumed within 3-4 days of delivery for optimal
											taste
										</Text>
									</>
								) : (
									<>
										<Text className="text-gray-700 mb-2">
											👩‍🍳 Our team will start preparing your delicious desserts
										</Text>
										<Text className="text-gray-700 mb-2">
											📱 We'll keep you updated on your order status
										</Text>
										<Text className="text-gray-700 mb-0">
											⏰ Your order will be ready for pickup on{" "}
											{pickupInfo || "your selected date"}
										</Text>
									</>
								)}
							</div>
						</Section>

						{/* Contact Information */}
						<Section className="mb-8">
							<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
								Need Help?
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
