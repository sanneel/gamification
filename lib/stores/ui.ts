import { create } from "zustand";

interface UIStore {
  miniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  toggleMiniCart: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  miniCartOpen: false,
  openMiniCart: () => set({ miniCartOpen: true }),
  closeMiniCart: () => set({ miniCartOpen: false }),
  toggleMiniCart: () => set((s) => ({ miniCartOpen: !s.miniCartOpen })),
}));
