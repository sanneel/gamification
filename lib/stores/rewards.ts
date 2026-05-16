import { create } from "zustand";

export type RewardOfferType =
  | "abandoned_browse"
  | "abandoned_cart"
  | "daily_scratch"
  | "first_visit"
  | "comeback";

export interface RewardOffer {
  id: string;
  type: RewardOfferType;
  headline: string;
  body: string;
  cta: string;
  ctaHref: string;
  emoji: string;
  code?: string;
  expiresAt?: number; // ms timestamp
}

interface RewardsStore {
  popup: RewardOffer | null;
  scratchCardOpen: boolean;
  claimedCodes: string[];
  lastSeen: number; // timestamp of last popup shown
  showPopup: (offer: RewardOffer) => void;
  dismissPopup: () => void;
  openScratchCard: () => void;
  closeScratchCard: () => void;
  claimCode: (code: string) => void;
  hasClaimedCode: (code: string) => boolean;
  canShowPopup: () => boolean;
}

export const useRewardsStore = create<RewardsStore>()((set, get) => ({
  popup: null,
  scratchCardOpen: false,
  claimedCodes: [],
  lastSeen: 0,

  showPopup(offer) {
    set({ popup: offer, lastSeen: Date.now() });
  },

  dismissPopup() {
    set({ popup: null });
  },

  openScratchCard() {
    set({ scratchCardOpen: true });
  },

  closeScratchCard() {
    set({ scratchCardOpen: false });
  },

  claimCode(code) {
    set((s) => ({ claimedCodes: [...s.claimedCodes, code] }));
  },

  hasClaimedCode(code) {
    return get().claimedCodes.includes(code);
  },

  // Don't show a popup more than once per 90 seconds
  canShowPopup() {
    return Date.now() - get().lastSeen > 90_000;
  },
}));

// ── Reward offer templates ────────────────────────────────────────────────────

export const REWARD_OFFERS: Record<RewardOfferType, Omit<RewardOffer, "id">> = {
  abandoned_browse: {
    type: "abandoned_browse",
    headline: "Still looking? 👀",
    body: "Here's 10% off to help you decide. Goes away in 15 minutes.",
    cta: "Claim 10% Off",
    ctaHref: "/build-a-box",
    emoji: "💸",
    code: "BROWSE10",
  },
  abandoned_cart: {
    type: "abandoned_cart",
    headline: "Your box misses you 💌",
    body: "You left something in your cart. We saved it — and added free shipping.",
    cta: "Complete Your Box",
    ctaHref: "/build-a-box",
    emoji: "🎁",
    code: "FREESHIP",
  },
  daily_scratch: {
    type: "daily_scratch",
    headline: "Daily reward ready! 🎰",
    body: "Scratch your daily card for a surprise discount or free gift.",
    cta: "Scratch Now",
    ctaHref: "#scratch",
    emoji: "🎴",
  },
  first_visit: {
    type: "first_visit",
    headline: "Welcome to Gamif! 🎉",
    body: "First order gets 15% off automatically. No code needed.",
    cta: "Start Building",
    ctaHref: "/build-a-box",
    emoji: "✨",
    code: "WELCOME15",
  },
  comeback: {
    type: "comeback",
    headline: "We missed you! 💕",
    body: "Been a while. Here's something to celebrate your return.",
    cta: "See What's New",
    ctaHref: "/shop",
    emoji: "🌸",
    code: "COMEBACK20",
  },
};
