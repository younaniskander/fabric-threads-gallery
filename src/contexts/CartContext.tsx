import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { parsePriceAmount } from "@/lib/phoneAuth";

export interface CartItem {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  price: number; // price in EGP (piastres for Stripe)
  priceDisplay: string;
  color?: string;
  colorName?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string, color?: string) => void;
  updateQuantity: (id: string, color: string | undefined, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "adam-cart";

function getKey(item: { id: string; color?: string }) {
  return `${item.id}__${item.color || "default"}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const normalizedItem = {
        ...item,
        price: item.price > 0 ? item.price : parsePriceAmount(item.priceDisplay),
      };
      const key = getKey(item);
      const existing = prev.find((i) => getKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          getKey(i) === key
            ? {
                ...i,
                ...normalizedItem,
                quantity: i.quantity + qty,
              }
            : i,
        );
      }
      return [...prev, { ...normalizedItem, quantity: qty }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string, color?: string) => {
    setItems((prev) => prev.filter((i) => getKey(i) !== `${id}__${color || "default"}`));
  };

  const updateQuantity = (id: string, color: string | undefined, qty: number) => {
    if (qty <= 0) return removeItem(id, color);
    setItems((prev) =>
      prev.map((i) => getKey(i) === `${id}__${color || "default"}` ? { ...i, quantity: qty } : i)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + (i.price || parsePriceAmount(i.priceDisplay)) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
