export const getStatusColor = (status: string) => {
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
		case "dispatched":
			return "bg-cyan-100 text-cyan-800 border-cyan-200";
		case "completed":
			return "bg-gray-100 text-gray-800 border-gray-200";
		case "cancelled":
			return "bg-red-100 text-red-800 border-red-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

export const getPaymentStatusColor = (status: string) => {
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

export const formatStatus = (status: string) => {
	return status
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};
