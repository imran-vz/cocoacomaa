"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cartItem } from "@/lib/animations";
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
	const [isOpen, setIsOpen] = useState(false);

	const handleQuantityChange = (itemId: number, newQuantity: number) => {
		if (newQuantity <= 0) {
			removeItem(itemId);
		} else {
			updateQuantity(itemId, newQuantity);
		}
	};

	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative cursor-pointer hover:bg-muted/50 transition-colors"
				>
					<ShoppingCart className="h-5 w-5" />
					<AnimatePresence mode="wait">
						{totalItems > 0 && (
							<motion.div
								key={totalItems}
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: [1, 1.3, 1], opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}
								transition={{ duration: 0.3, ease: "easeOut" }}
								className="absolute -top-1 -right-1"
							>
								<Badge
									variant="destructive"
									className="h-5 w-5 p-0 flex items-center justify-center text-xs shadow-sm border border-background"
								>
									{totalItems}
								</Badge>
							</motion.div>
						)}
					</AnimatePresence>
					<span className="sr-only">Shopping cart</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				side="right"
				className="w-[85vw] sm:max-w-md flex flex-col p-4 sm:p-6 border-l shadow-2xl"
			>
				<SheetHeader className="text-left pb-4 border-b shrink-0 px-0 pt-6">
					<SheetTitle className="font-bold text-xl sm:text-2xl flex items-center gap-2 tracking-tight">
						<ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
						Your Cart
					</SheetTitle>
				</SheetHeader>
				{items.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
						<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
							<ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
						</div>
						<p className="text-muted-foreground font-medium">
							Your cart is empty
						</p>
						<Button
							variant="outline"
							onClick={() => setIsOpen(false)}
							className="mt-4"
						>
							Continue Shopping
						</Button>
					</div>
				) : (
					<>
						<div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 py-4 scrollbar-thin scrollbar-thumb-muted">
							<AnimatePresence mode="popLayout" initial={false}>
								{items.map((item) => (
									<motion.div
										key={item.id}
										variants={cartItem}
										initial="hidden"
										animate="visible"
										exit="exit"
										layout
										className="flex justify-between items-center gap-3 p-3 sm:p-4 rounded-xl border bg-card text-card-foreground shadow-sm group"
									>
										<div className="flex-1 min-w-0 pr-2">
											<h4 className="font-semibold text-sm sm:text-base leading-tight truncate">
												{item.name}
											</h4>
											<p className="text-sm font-medium text-muted-foreground mt-1 tracking-tight">
												{formatCurrency(Number(item.price))}
												<span className="text-xs ml-1 opacity-70">each</span>
											</p>
										</div>
										<div className="flex justify-center items-center bg-muted/50 rounded-lg p-1 shrink-0">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 sm:h-8 sm:w-8 rounded-md hover:bg-background shadow-sm"
												onClick={() =>
													handleQuantityChange(item.id, item.quantity - 1)
												}
											>
												<Minus className="h-3.5 w-3.5" />
											</Button>
											<motion.span
												key={`qty-${item.id}-${item.quantity}`}
												initial={{ scale: 1 }}
												animate={{ scale: [1, 1.3, 1] }}
												transition={{ duration: 0.3, ease: "easeOut" }}
												className="w-8 text-center text-sm font-bold tabular-nums"
											>
												{item.quantity}
											</motion.span>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 sm:h-8 sm:w-8 rounded-md hover:bg-background shadow-sm"
												onClick={() =>
													handleQuantityChange(item.id, item.quantity + 1)
												}
											>
												<Plus className="h-3.5 w-3.5" />
											</Button>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>

						<div className="shrink-0 pt-4 pb-2 border-t mt-auto space-y-4 bg-background">
							<div className="flex justify-between items-end font-semibold text-lg px-1">
								<span className="text-muted-foreground">Subtotal</span>
								<motion.span
									key={total}
									initial={{ scale: 1 }}
									animate={{ scale: [1, 1.15, 1] }}
									transition={{ duration: 0.3, ease: "easeOut" }}
									className="text-xl sm:text-2xl text-primary"
								>
									{formatCurrency(Number(total))}
								</motion.span>
							</div>
							<p className="text-xs text-muted-foreground text-center px-4 leading-relaxed">
								Delivery costs and taxes will be calculated at checkout.
							</p>
							<Button
								className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-md rounded-xl cursor-pointer"
								onClick={() => {
									setIsOpen(false);
									onCheckout();
								}}
								disabled={disabled}
								variant={disabled ? "secondary" : "default"}
							>
								{checkoutLabel}
							</Button>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
