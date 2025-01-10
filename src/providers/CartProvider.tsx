"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";

type CartItem = {
	id: number;
	name: string;
	price: number;
	quantity: number;
};

type CartContextType = {
	cart: CartItem[];
	addToCart: (item: Omit<CartItem, "quantity">) => void;
	cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [cart, setCart] = useState<CartItem[]>([]);

	const addToCart = (item: Omit<CartItem, "quantity">) => {
		setCart((prevCart) => {
			const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
			if (existingItem) {
				return prevCart.map((cartItem) =>
					cartItem.id === item.id
						? { ...cartItem, quantity: cartItem.quantity + 1 }
						: cartItem,
				);
			}
			return [...prevCart, { ...item, quantity: 1 }];
		});
	};

	const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

	return (
		<CartContext.Provider value={{ cart, addToCart, cartCount }}>
			{children}
		</CartContext.Provider>
	);
};
