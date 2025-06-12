"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";

interface CartItem {
	id: number;
	name: string;
	price: number;
	quantity: number;
	customization: string;
}

interface CartState {
	items: CartItem[];
	total: number;
}

type CartAction =
	| { type: "ADD_ITEM"; payload: CartItem }
	| { type: "REMOVE_ITEM"; payload: number }
	| { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
	| { type: "CLEAR_CART" };

const initialState: CartState = {
	items: [],
	total: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
	switch (action.type) {
		case "ADD_ITEM": {
			const existingItem = state.items.find(
				(item) => item.id === action.payload.id,
			);

			if (existingItem) {
				return {
					...state,
					items: state.items.map((item) =>
						item.id === action.payload.id
							? { ...item, quantity: item.quantity + 1 }
							: item,
					),
					total: state.total + action.payload.price,
				};
			}

			return {
				...state,
				items: [...state.items, { ...action.payload, quantity: 1 }],
				total: state.total + action.payload.price,
			};
		}

		case "REMOVE_ITEM": {
			const item = state.items.find((item) => item.id === action.payload);
			if (!item) return state;

			return {
				...state,
				items: state.items.filter((item) => item.id !== action.payload),
				total: state.total - item.price * item.quantity,
			};
		}

		case "UPDATE_QUANTITY": {
			const item = state.items.find((item) => item.id === action.payload.id);
			if (!item) return state;

			const quantityDiff = action.payload.quantity - item.quantity;

			return {
				...state,
				items: state.items.map((item) =>
					item.id === action.payload.id
						? { ...item, quantity: action.payload.quantity }
						: item,
				),
				total: state.total + item.price * quantityDiff,
			};
		}

		case "CLEAR_CART":
			return initialState;

		default:
			return state;
	}
}

const CartContext = createContext<{
	items: CartItem[];
	total: number;
	addItem: (item: CartItem) => void;
	removeItem: (id: number) => void;
	updateQuantity: (id: number, quantity: number) => void;
	clearCart: () => void;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(cartReducer, initialState);

	useEffect(() => {
		const savedCart = localStorage.getItem("cart");
		if (savedCart) {
			const { items, total } = JSON.parse(savedCart);
			dispatch({ type: "CLEAR_CART" });
			for (const item of items as CartItem[]) {
				dispatch({ type: "ADD_ITEM", payload: item });
			}
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("cart", JSON.stringify(state));
	}, [state]);

	const addItem = (item: CartItem) => {
		dispatch({ type: "ADD_ITEM", payload: item });
	};

	const removeItem = (id: number) => {
		dispatch({ type: "REMOVE_ITEM", payload: id });
	};

	const updateQuantity = (id: number, quantity: number) => {
		dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
	};

	const clearCart = () => {
		dispatch({ type: "CLEAR_CART" });
	};

	return (
		<CartContext.Provider
			value={{
				items: state.items,
				total: state.total,
				addItem,
				removeItem,
				updateQuantity,
				clearCart,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
