import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(product, qty = 1) {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: qty }] };
        });
      },

      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQuantity(productId, qty) {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity: qty } : i
          ),
        }));
      },

      clearCart() {
        set({ items: [] });
      },

      itemCount() {
        return get().items.reduce((n, i) => n + i.quantity, 0);
      },

      subtotal() {
        return get().items.reduce(
          (s, i) => s + i.product.normalPrice * i.quantity,
          0
        );
      },
    }),
    {
      name: "gamif-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
