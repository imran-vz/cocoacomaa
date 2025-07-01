import { render } from "@react-email/render";
import { Resend } from "resend";
import OrderConfirmationEmail from "@/components/emails/order-confirmation";
import OrderStatusUpdateEmail from "@/components/emails/order-status-update";

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
Order ID: ${orderDetails.id}
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
	!isPostalOrder
		? `PICKUP LOCATION:
Cocoa Comaa
Akshaya Gold Apartment,
Pipe Line Rd, VGS Layout,
Ejipura, Bengaluru - 560047
Phone: ${process.env.NEXT_PUBLIC_BUSINESS_PHONE}`
		: ""
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
			subject: `Order Confirmed #${orderDetails.id} - Cocoa Comaa`,
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

	try {
		const emailHtml = await render(OrderStatusUpdateEmail({ orderDetails }));

		const plainText = `
Order Status Update - ${orderDetails.id}

Hi ${orderDetails.user.name || "Customer"},

Your order status has been updated from ${previousStatus} to ${orderDetails.status}.

Order Details:
- Order ID: ${orderDetails.id}
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
			subject: `Order Update #${orderDetails.id} - Status Changed`,
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
