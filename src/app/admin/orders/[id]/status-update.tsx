"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { formatStatus, getStatusColor } from "@/app/(user)/order/[id]/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface StatusUpdateProps {
	orderId: string;
	currentStatus: string;
	onStatusUpdate: (newStatus: string) => void;
}

const ORDER_STATUSES = [
	{ value: "pending", label: "Order Received" },
	{ value: "payment_pending", label: "Payment Pending" },
	{ value: "paid", label: "Payment Confirmed" },
	{ value: "confirmed", label: "Order Confirmed" },
	{ value: "preparing", label: "Preparing" },
	{ value: "ready", label: "Ready for Pickup" },
	{ value: "completed", label: "Completed" },
	{ value: "cancelled", label: "Cancelled" },
];

export default function StatusUpdate({
	orderId,
	currentStatus,
	onStatusUpdate,
}: StatusUpdateProps) {
	const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
	const [isUpdating, setIsUpdating] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const selectId = useId();

	const handleStatusUpdate = async () => {
		if (selectedStatus === currentStatus) {
			toast.info("Status is already set to this value");
			return;
		}

		setShowConfirmDialog(true);
	};

	const confirmStatusUpdate = async () => {
		setIsUpdating(true);
		setShowConfirmDialog(false);

		try {
			const response = await fetch(`/api/orders/${orderId}/status`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					status: selectedStatus,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update status");
			}

			onStatusUpdate(selectedStatus);
			toast.success(
				`Order status updated to ${formatStatus(selectedStatus)}. Customer notification sent.`,
			);
		} catch (error) {
			console.error("Error updating status:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update order status",
			);
			// Reset selection on error
			setSelectedStatus(currentStatus);
		} finally {
			setIsUpdating(false);
		}
	};

	const cancelStatusUpdate = () => {
		setShowConfirmDialog(false);
		setSelectedStatus(currentStatus);
	};

	const isStatusChanged = selectedStatus !== currentStatus;

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<RefreshCw className="h-5 w-5" />
						Update Order Status
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Current Status */}
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">Current Status:</span>
						<Badge className={getStatusColor(currentStatus)}>
							{formatStatus(currentStatus)}
						</Badge>
					</div>

					{/* Status Selector */}
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor={selectId}>
							Update to:
						</label>
						<Select
							value={selectedStatus}
							onValueChange={setSelectedStatus}
							disabled={isUpdating}
						>
							<SelectTrigger id={selectId}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ORDER_STATUSES.map((status) => (
									<SelectItem key={status.value} value={status.value}>
										<div className="flex items-center gap-2">
											<span>{status.label}</span>
											{status.value === currentStatus && (
												<Badge variant="secondary" className="text-xs">
													Current
												</Badge>
											)}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Update Button */}
					<Button
						onClick={handleStatusUpdate}
						disabled={!isStatusChanged || isUpdating}
						className="w-full"
					>
						{isUpdating ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Updating Status...
							</>
						) : (
							"Update Status"
						)}
					</Button>

					{isStatusChanged && !isUpdating && (
						<p className="text-sm text-muted-foreground">
							The customer will be notified via email when the status is
							updated.
						</p>
					)}
				</CardContent>
			</Card>

			{/* Confirmation Dialog */}
			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to update the order status? This will notify
							the customer via email.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="my-4 p-4 bg-muted rounded-lg">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">Current:</span>
								<Badge className={getStatusColor(currentStatus)}>
									{formatStatus(currentStatus)}
								</Badge>
							</div>
							<span className="text-lg">→</span>
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">New:</span>
								<Badge className={getStatusColor(selectedStatus)}>
									{formatStatus(selectedStatus)}
								</Badge>
							</div>
						</div>
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelStatusUpdate}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={confirmStatusUpdate}>
							Update Status
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
