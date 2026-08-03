import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Product } from "@/data/products";

export type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  condition: string;
  size: string;
  image: string;
};

type CartState = { items: CartItem[]; isOpen: boolean };

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "TOGGLE_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      if (state.items.some((i) => i.id === action.item.id)) return { ...state, isOpen: true };
      return { ...state, items: [...state.items, action.item], isOpen: true };
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  subtotal: number;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  isInCart: (id: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  const addItem = (product: Product) => {
    dispatch({
      type: "ADD_ITEM",
      item: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        condition: product.condition,
        size: product.sizes[0] ?? "",
        image: product.image,
      },
    });
  };

  const value: CartContextValue = {
    items: state.items,
    isOpen: state.isOpen,
    count: state.items.length,
    subtotal: state.items.reduce((sum, i) => sum + i.price, 0),
    addItem,
    removeItem: (id) => dispatch({ type: "REMOVE_ITEM", id }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
    openCart: () => dispatch({ type: "OPEN_CART" }),
    closeCart: () => dispatch({ type: "CLOSE_CART" }),
    toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
    isInCart: (id) => state.items.some((i) => i.id === id),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function buildCartWhatsAppMessage(items: CartItem[], storeName: string) {
  if (items.length === 0) return "";
  const lines = items.map(
    (i, idx) =>
      `${idx + 1}. ${i.name} (${i.condition}, ${i.size}) — PKR ${i.price.toLocaleString()}`,
  );
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return `Hi ${storeName}, I'd like to order:\n\n${lines.join("\n")}\n\nTotal: PKR ${total.toLocaleString()}`;
}
