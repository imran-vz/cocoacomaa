"use client";

import { Check, Download, FileText, PlusCircle } from "lucide-react";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type ExportData = {
	orderId: string;
	itemName: string;
	customerName: string;
	customerPhone: string;
	address: string;
	message: string | null;
	status: Order["status"];
	orderType: Order["orderType"];
	createdAt: Date;
};

interface ExportFilterDialogProps {
	data: ExportData[];
	statuses: { label: string; value: Order["status"] }[];
	orderTypes: { label: string; value: Order["orderType"] }[];
}

interface MultiSelectProps {
	options: { label: string; value: Order["status"] }[];
	selectedValues: Order["status"][];
	onSelectionChange: (values: Order["status"][]) => void;
	title: string;
	placeholder?: string;
}

function MultiSelect({
	options,
	selectedValues,
	onSelectionChange,
	title,
	placeholder = "Select options",
}: MultiSelectProps) {
	const selectedSet = new Set(selectedValues);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="w-full justify-start text-left font-normal"
				>
					<PlusCircle className="mr-2 h-4 w-4" />
					{selectedValues.length === 0 ? (
						<span className="text-muted-foreground">{placeholder}</span>
					) : (
						<>
							{selectedValues.length === 1 ? (
								<span>
									{
										options.find((opt) => opt.value === selectedValues[0])
											?.label
									}
								</span>
							) : (
								<span>{selectedValues.length} selected</span>
							)}
							{selectedValues.length > 0 && (
								<>
									<Separator orientation="vertical" className="mx-2 h-4" />
									<div className="flex space-x-1">
										{selectedValues.length > 2 ? (
											<Badge
												variant="secondary"
												className="rounded-sm px-1 font-normal"
											>
												{selectedValues.length} selected
											</Badge>
										) : (
											selectedValues.map((value) => {
												const option = options.find(
													(opt) => opt.value === value,
												);
												return (
													<Badge
														key={value}
														variant="secondary"
														className="rounded-sm px-1 font-normal"
													>
														{option?.label}
													</Badge>
												);
											})
										)}
									</div>
								</>
							)}
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedSet.has(option.value);
								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											const newValues = isSelected
												? selectedValues.filter((v) => v !== option.value)
												: [...selectedValues, option.value];
											onSelectionChange(newValues);
										}}
									>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<Check className={cn("h-4 w-4")} />
										</div>
										<span>{option.label}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.length > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => onSelectionChange([])}
										className="justify-center text-center"
									>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function exportToCSV(data: ExportData[], filename: string) {
	// Create CSV content
	const csvContent = [
		// Headers
		["Item Name", "Customer Name", "Customer Phone", "Address", "Message"].join(
			",",
		),
		// Data rows
		...data.map((row) =>
			[
				`"${row.itemName}"`,
				`"${row.customerName}"`,
				`"${row.customerPhone}"`,
				`"${row.address}"`,
				`"${row.message || "No message"}"`,
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

async function exportToPDF(data: ExportData[], filename: string) {
	// Dynamically import PDF libraries
	const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
		import("jspdf"),
		import("jspdf-autotable"),
	]);

	const doc = new jsPDF({
		orientation: "landscape", // Use landscape for better table layout
		unit: "mm",
		format: "a4",
	});

	// Add title
	doc.setFontSize(20);
	doc.text("Orders Export", 14, 22);

	// Add export info
	doc.setFontSize(12);
	doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
	doc.text(`Total Orders: ${data.length}`, 14, 40);

	// Prepare table data
	const tableColumns = [
		"Item Name",
		"Customer Name",
		"Customer Phone",
		"Address",
		"Message",
	];

	const tableRows = data.map((row) => [
		row.itemName,
		row.customerName,
		row.customerPhone,
		row.address,
		row.message || "No message",
	]);

	// Generate table with proper text wrapping
	autoTable(doc, {
		head: [tableColumns],
		body: tableRows,
		startY: 50,
		styles: {
			fontSize: 8,
			cellPadding: 2,
			overflow: "linebreak",
			cellWidth: "wrap",
			valign: "top",
			halign: "left",
		},
		headStyles: {
			fillColor: [41, 128, 185],
			textColor: 255,
			fontSize: 9,
			fontStyle: "bold",
			halign: "center",
			valign: "middle",
		},
		alternateRowStyles: {
			fillColor: [245, 245, 245],
		},
		margin: { top: 50, right: 14, bottom: 20, left: 14 },
		theme: "striped",
		tableWidth: "auto",
		columnStyles: {
			0: { cellWidth: 45, cellPadding: 2 }, // Item Name
			1: { cellWidth: 40, cellPadding: 2 }, // Customer Name
			2: { cellWidth: 35, halign: "center" }, // Customer Phone
			3: { cellWidth: 80, cellPadding: 2 }, // Address - wider for wrapping
			4: { cellWidth: 60, cellPadding: 2 }, // Message - wider for wrapping
		},
		didDrawPage: (data) => {
			// Add page numbers
			const pageCount = doc.getNumberOfPages();
			const pageSize = doc.internal.pageSize;
			const pageHeight = pageSize.height || pageSize.getHeight();

			doc.setFontSize(8);
			doc.text(
				`Page ${data.pageNumber} of ${pageCount}`,
				pageSize.width - 30,
				pageHeight - 10,
			);
		},
	});

	// Save the PDF
	doc.save(filename);
}

export default function ExportFilterDialog({
	data,
	statuses,
	orderTypes,
}: ExportFilterDialogProps) {
	const [open, setOpen] = useState(false);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [selectedStatuses, setSelectedStatuses] = useState<Order["status"][]>([
		"preparing",
	]);
	const [selectedOrderType, setSelectedOrderType] = useState<
		| Order["orderType"]
		| "all"
		// this was added so the setState will play nice with the Select Component Types
		| (string & {})
	>("postal-brownies");
	const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");

	const startDateId = useId();
	const endDateId = useId();
	const orderTypeId = useId();
	const csvId = useId();
	const pdfId = useId();

	const handleExport = async () => {
		// Apply filters
		let filteredData = [...data];

		// Filter by date range
		if (startDate) {
			const startDateTime = new Date(startDate);
			filteredData = filteredData.filter(
				(item) => item.createdAt >= startDateTime,
			);
		}

		if (endDate) {
			const endDateTime = new Date(endDate);
			endDateTime.setHours(23, 59, 59, 999); // Set to end of day
			filteredData = filteredData.filter(
				(item) => item.createdAt <= endDateTime,
			);
		}

		// Filter by status
		if (selectedStatuses.length > 0) {
			filteredData = filteredData.filter((item) =>
				selectedStatuses.includes(item.status),
			);
		}

		// Filter by order type
		if (selectedOrderType !== "all") {
			filteredData = filteredData.filter(
				(item) => item.orderType === selectedOrderType,
			);
		}

		// Generate filename with filters
		const today = new Date().toISOString().split("T")[0];
		let filename = `orders-export-${today}`;

		if (startDate || endDate) {
			filename += `-${startDate || "start"}-to-${endDate || "end"}`;
		}
		if (selectedStatuses.length > 0) {
			filename += `-${selectedStatuses.join("-")}`;
		}
		if (selectedOrderType !== "all") {
			filename += `-${selectedOrderType}`;
		}
		filename += exportFormat === "csv" ? ".csv" : ".pdf";

		// Export based on selected format
		if (exportFormat === "csv") {
			exportToCSV(filteredData, filename);
		} else {
			await exportToPDF(filteredData, filename);
		}

		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full sm:w-auto">
					<Download className="mr-2 h-4 w-4" />
					Export Orders
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Export Orders</DialogTitle>
					<DialogDescription>
						Configure filters and format for your export. Leave fields empty to
						include all data.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label>Export Format</Label>
						<RadioGroup
							value={exportFormat}
							onValueChange={(value: "csv" | "pdf") => setExportFormat(value)}
							className="flex gap-6"
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="csv" id={csvId} />
								<Label
									htmlFor={csvId}
									className="flex items-center gap-2 cursor-pointer"
								>
									<FileText className="h-4 w-4" />
									CSV File
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="pdf" id={pdfId} />
								<Label
									htmlFor={pdfId}
									className="flex items-center gap-2 cursor-pointer"
								>
									<FileText className="h-4 w-4" />
									PDF Document
								</Label>
							</div>
						</RadioGroup>
					</div>
					<div className="grid gap-2">
						<Label htmlFor={startDateId}>Start Date</Label>
						<Input
							id={startDateId}
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor={endDateId}>End Date</Label>
						<Input
							id={endDateId}
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label>Status</Label>
						<MultiSelect
							options={statuses}
							selectedValues={selectedStatuses}
							onSelectionChange={setSelectedStatuses}
							title="Status"
							placeholder="Select statuses"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor={orderTypeId}>Order Type</Label>
						<Select
							value={selectedOrderType}
							onValueChange={setSelectedOrderType}
						>
							<SelectTrigger id={orderTypeId}>
								<SelectValue placeholder="Select order type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Order Types</SelectItem>
								{orderTypes.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
					>
						Cancel
					</Button>
					<Button type="button" onClick={handleExport}>
						<Download className="mr-2 h-4 w-4" />
						Export Filtered {exportFormat.toUpperCase()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
