"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExportData = {
	orderId: string;
	itemName: string;
	customerName: string;
	customerPhone: string;
	address: string;
};

interface ExportButtonProps {
	data: ExportData[];
}

function exportToCSV(data: ExportData[], filename: string) {
	// Create CSV content
	const csvContent = [
		// Headers
		[
			"Order ID",
			"Item Name",
			"Customer Name",
			"Customer Phone",
			"Address",
		].join(","),
		// Data rows
		...data.map((row) =>
			[
				`"${row.orderId}"`,
				`"${row.itemName}"`,
				`"${row.customerName}"`,
				`"${row.customerPhone}"`,
				`"${row.address}"`,
			].join(","),
		),
	].join("\n");

	// Create and download file
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);
	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export default function ExportButton({ data }: ExportButtonProps) {
	const handleExport = () => {
		const filename = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
		exportToCSV(data, filename);
	};

	return (
		<Button
			onClick={handleExport}
			variant="outline"
			className="w-full sm:w-auto"
		>
			<Download className="mr-2 h-4 w-4" />
			Export CSV
		</Button>
	);
}
