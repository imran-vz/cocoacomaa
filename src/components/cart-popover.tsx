"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";

interface CartPopoverProps {
	onCheckout: () => void;
	disabled?: boolean;
	checkoutLabel?: string;
}

export function CartPopover({
	onCheckout,
	disabled = false,
	checkoutLabel = "Proceed to Checkout",
}: CartPopoverProps) {
	const { items, removeItem, updateQuantity, total } = useCart();

	const handleQuantityChange = (itemId: number, newQuantity: number) => {
		if (newQuantity <= 0) {
			removeItem(itemId);
		} else {
			updateQuantity(itemId, newQuantity);
		}
	};

	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<ShoppingCart className="h-5 w-5" />
					{totalItems > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
						>
							{totalItems}
						</Badge>
					)}
					<span className="sr-only">Shopping cart</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80">
				<div className="space-y-2">
					<h3 className="font-semibold text-lg flex items-center gap-2">
						<ShoppingCart className="h-4 w-4" />
						Your Cart
					</h3>
					<Separator />
					{items.length === 0 ? (
						<p className="text-muted-foreground text-center py-6">
							Your cart is empty
						</p>
					) : (
						<>
							<div className="max-h-[300px] overflow-y-auto space-y-3">
								{items.map((item) => (
									<div
										key={item.id}
										className="flex justify-between items-start gap-2"
									>
										<div className="flex-1 min-w-0">
											<h4 className="font-medium text-sm leading-tight">
												{item.name}
											</h4>
											<p className="text-xs text-muted-foreground">
												{formatCurrency(Number(item.price))} x {item.quantity}
											</p>
										</div>
										<div className="flex items-center space-x-1 shrink-0">
											<Button
												variant="outline"
												size="icon"
												className="h-6 w-6"
												onClick={() =>
													handleQuantityChange(item.id, item.quantity - 1)
												}
											>
												<Minus className="h-3 w-3" />
											</Button>
											<span className="w-6 text-center text-xs font-medium">
												{item.quantity}
											</span>
											<Button
												variant="outline"
												size="icon"
												className="h-6 w-6"
												onClick={() =>
													handleQuantityChange(item.id, item.quantity + 1)
												}
											>
												<Plus className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))}
							</div>
							<Separator />
							<div className="space-y-3">
								<div className="flex justify-between items-center font-medium">
									<span>Total:</span>
									<span>{formatCurrency(Number(total))}</span>
								</div>
								<Button
									className="w-full"
									onClick={onCheckout}
									disabled={disabled}
									variant={disabled ? "secondary" : "default"}
								>
									{checkoutLabel}
								</Button>
							</div>
						</>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
