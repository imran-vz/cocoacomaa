import { render } from "@react-email/render";
import { Resend } from "resend";
import EmailVerificationEmail from "@/components/emails/email-verification";
import OrderConfirmationEmail from "@/components/emails/order-confirmation";
import OrderStatusUpdateEmail from "@/components/emails/order-status-update";
import PasswordResetEmail from "@/components/emails/password-reset";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
	itemName: string;
	quantity: number;
	price: string;
}

interface OrderDetails {
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
}

export async function sendOrderConfirmationEmail(orderDetails: OrderDetails) {
	try {
		// Render the React email component to HTML
		const emailHtml = await render(OrderConfirmationEmail({ orderDetails }));

		// Generate plain text version
		const customerName = orderDetails.user.name || "Customer";
		const isPostalOrder = orderDetails.orderType === "postal-brownies";

		const textContent = `
🎉 ORDER CONFIRMED! 🎉

Thank you for your order, ${customerName}!

ORDER DETAILS:
Order ID: ${orderDetails.id.slice(-8).toUpperCase()}
Order Type: ${isPostalOrder ? "Postal Brownies" : "Cake Orders"}

ORDER ITEMS:
${orderDetails.orderItems
	.map(
		(item) =>
			`- ${item.itemName} x${item.quantity} = ₹${(
				Number(item.price) * item.quantity
			).toFixed(0)}`,
	)
	.join("\n")}

TOTAL: ₹${Number(orderDetails.total).toFixed(0)}

${orderDetails.notes ? `NOTES: "${orderDetails.notes}"` : ""}

${
	isPostalOrder
		? `DELIVERY ADDRESS:
${orderDetails.address?.addressLine1}${
	orderDetails.address?.addressLine2
		? `\n${orderDetails.address.addressLine2}`
		: ""
}
${orderDetails.address?.city}, ${orderDetails.address?.state} - ${
				orderDetails.address?.zip
			}

📦 POSTAL BROWNIES INFO:
🍫 Your fresh brownies will be baked to perfection
📦 Special insulated packaging ensures freshness
📱 Tracking info will be sent via SMS/WhatsApp
🚛 Expected delivery: 2-3 business days
❄️ Best consumed within 3-4 days for optimal taste

CARE INSTRUCTIONS:
• Inspect brownies immediately upon delivery
• Store in cool, dry place (room temperature)
• Refrigerate only if area is very humid
• Pair with milk or hot beverage for best experience`
		: `PICKUP LOCATION:
Cocoa Comaa
Akshaya Gold Apartment,
Pipe Line Rd, VGS Layout,
Ejipura, Bengaluru - 560047
Phone: ${process.env.NEXT_PUBLIC_BUSINESS_PHONE}`
}

NEED HELP?
Phone: ${process.env.NEXT_PUBLIC_BUSINESS_PHONE}
Email: contact@cocoacomaa.com
WhatsApp: https://wa.me/918431873579
Available: Wednesday to Sunday, 9 AM - 6 PM IST

Thank you for choosing Cocoa Comaa! 🍰
		`;

		await resend.emails.send({
			from: "Cocoa Comaa <orders@cocoacomaa.com>",
			to: [orderDetails.user.email],
			subject: `Order Confirmed #${orderDetails.id.slice(-8).toUpperCase()} - Cocoa Comaa`,
			html: emailHtml,
			text: textContent.trim(),
		});

		console.log(
			`Order confirmation email sent to ${orderDetails.user.email} for order ${orderDetails.id}`,
		);
		return { success: true };
	} catch (error) {
		console.error("Error sending order confirmation email:", error);
		return { success: false, error };
	}
}

export async function sendOrderStatusUpdateEmail(
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
		orderItems: {
			quantity: number;
			price: string;
			itemName: string;
		}[];
		address?: {
			addressLine1: string;
			addressLine2?: string | null;
			city: string;
			state: string;
			zip: string;
		} | null;
	},
	previousStatus: string,
) {
	if (!resend) {
		throw new Error("Resend is not initialized");
	}

	// Function to get descriptive subject line based on status
	function getStatusSubject(status: string): string {
		const subjectMap: Record<string, string> = {
			pending: "Order Received - We're Processing Your Request",
			payment_pending: "Payment Required - Complete Your Order",
			paid: "Payment Confirmed - Thank You!",
			confirmed: "Order Confirmed - We'll Start Preparing Soon",
			preparing: "In the Kitchen - Your Order is Being Prepared",
			ready: "Ready for Pickup - Come Get Your Treats!",
			completed: "Order Complete - Thank You for Choosing Us!",
			cancelled: "Order Cancelled - We're Here to Help",
		};

		return subjectMap[status] || "Order Status Updated";
	}

	try {
		const emailHtml = await render(OrderStatusUpdateEmail({ orderDetails }));

		const plainText = `
Order Status Update - ${orderDetails.id.slice(-8).toUpperCase()}

Hi ${orderDetails.user.name || "Customer"},

Your order status has been updated from ${previousStatus} to ${orderDetails.status}.

Order Details:
- Order ID: ${orderDetails.id.slice(-8).toUpperCase()}
- Total: ₹${orderDetails.total}
- Order Type: ${orderDetails.orderType === "postal-brownies" ? "Postal Brownies" : "Cake Orders"}

If you have any questions, please contact us at contact@cocoacomaa.com or call ${process.env.NEXT_PUBLIC_BUSINESS_PHONE}.

Thank you for choosing Cocoa Comaa!

Best regards,
Team Cocoa Comaa
`;

		const result = await resend.emails.send({
			from: "Cocoa Comaa <orders@cocoacomaa.com>",
			to: orderDetails.user.email,
			subject: `${getStatusSubject(orderDetails.status)} - Order #${orderDetails.id.slice(-8).toUpperCase()}`,
			html: emailHtml,
			text: plainText,
		});

		console.log(
			`Status update email sent successfully for order ${orderDetails.id}:`,
			result,
		);
		return result;
	} catch (error) {
		console.error(
			`Failed to send status update email for order ${orderDetails.id}:`,
			error,
		);
		throw error;
	}
}

export async function sendVerificationEmail({
	to,
	userName,
	url,
}: {
	to: string;
	userName: string;
	url: string;
}) {
	try {
		const emailHtml = await render(
			EmailVerificationEmail({ userName, verificationUrl: url }),
		);

		const textContent = `
Verify Your Email - Cocoa Comaa

Welcome to Cocoa Comaa, ${userName}!

Thank you for signing up. Please verify your email address to complete your registration.

Click the link below to verify your email:
${url}

This link will expire in 24 hours.

If you didn't create an account with Cocoa Comaa, please ignore this email.

Need help?
Phone: ${process.env.NEXT_PUBLIC_BUSINESS_PHONE}
Email: contact@cocoacomaa.com
WhatsApp: https://wa.me/918431873579

Thank you for choosing Cocoa Comaa! 🍰
		`;

		await resend.emails.send({
			from: "Cocoa Comaa <noreply@cocoacomaa.com>",
			to: [to],
			subject: "Verify your email - Cocoa Comaa",
			html: emailHtml,
			text: textContent.trim(),
		});

		console.log(`Verification email sent to ${to}`);
		return { success: true };
	} catch (error) {
		console.error("Error sending verification email:", error);
		return { success: false, error };
	}
}

export async function sendPasswordResetEmail({
	to,
	userName,
	url,
}: {
	to: string;
	userName: string;
	url: string;
}) {
	try {
		const emailHtml = await render(
			PasswordResetEmail({ userName, resetUrl: url }),
		);

		const textContent = `
Reset Your Password - Cocoa Comaa

Hi ${userName},

We received a request to reset your password for your Cocoa Comaa account.

Click the link below to reset your password:
${url}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact us if you have concerns.

Need help?
Phone: ${process.env.NEXT_PUBLIC_BUSINESS_PHONE}
Email: contact@cocoacomaa.com
WhatsApp: https://wa.me/918431873579

Thank you for choosing Cocoa Comaa! 🍰
		`;

		await resend.emails.send({
			from: "Cocoa Comaa <noreply@cocoacomaa.com>",
			to: [to],
			subject: "Reset your password - Cocoa Comaa",
			html: emailHtml,
			text: textContent.trim(),
		});

		console.log(`Password reset email sent to ${to}`);
		return { success: true };
	} catch (error) {
		console.error("Error sending password reset email:", error);
		return { success: false, error };
	}
}
