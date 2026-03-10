"use client";

interface ProcessingOverlayProps {
	isProcessing: boolean;
	stepDescription: string;
}

/**
 * Full-screen processing overlay shown during order creation and payment.
 * Extracted from checkout.tsx for reuse across checkout, workshops, and retry-payment.
 */
export function ProcessingOverlay({
	isProcessing,
	stepDescription,
}: ProcessingOverlayProps) {
	if (!isProcessing) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
			<div className="bg-white rounded-lg p-6 sm:p-8 max-w-sm mx-4 text-center shadow-xl">
				<div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4" />
				<h3 className="text-lg sm:text-xl font-semibold mb-2">
					Processing Order
				</h3>
				<p className="text-sm sm:text-base text-muted-foreground">
					{stepDescription || "Please wait..."}
				</p>
				<p className="text-xs text-muted-foreground mt-2">
					Do not close this window
				</p>
			</div>
		</div>
	);
}
