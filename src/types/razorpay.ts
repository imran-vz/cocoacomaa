// Razorpay types
export interface RazorpayOptions {
	key: string;
	amount: number;
	currency: string;
	name: string;
	description: string;
	order_id: string;
	image?: string;
	remember_customer?: boolean;
	handler: (response: RazorpayResponse) => void;
	modal?: {
		ondismiss?: () => void;
	};
	prefill: {
		name: string;
		email: string;
		contact: string;
	};
	theme: {
		color: string;
	};
}

export interface RazorpayResponse {
	razorpay_payment_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
}

export interface RazorpayOrderData {
	success: boolean;
	orderId: string;
	razorpayOrderId: string;
	amount: number;
	currency: string;
}
