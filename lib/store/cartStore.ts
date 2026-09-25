import { create } from "zustand";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: string[];
  };
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  loading: boolean;
  setCart: (items: CartItem[], itemCount: number, subtotal: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  isOpen: false,
  loading: false,

  setCart: (items, itemCount, subtotal) =>
    set({ items, itemCount, subtotal }),

  clearCart: () =>
    set({ items: [], itemCount: 0, subtotal: 0 }),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setLoading: (loading) => set({ loading }),
}));