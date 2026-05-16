// ── Product ───────────────────────────────────────────────────────────────────

export type ProductCategory = 'main_surprise' | 'sweet_pick' | 'tiny_extra' | 'lucky_bonus';
export type Audience = 'for_her' | 'for_him' | 'couple' | 'neutral';
export type Vibe =
  | 'romantic'
  | 'cute'
  | 'cozy'
  | 'luxury'
  | 'funny'
  | 'soft'
  | 'gamer'
  | 'aesthetic';

export type Product = {
  id: string;
  title: string;
  description?: string | null;
  normalPrice: number;  // GEL in tetri (1 GEL = 100 tetri)
  boxPrice: number;     // discounted price when added to a box
  images: string[];
  stock: number;
  active: boolean;
  category: ProductCategory;
  audience: Audience;
  vibes: Vibe[];
  tags: string[];
  externalId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// ── Gift Box ──────────────────────────────────────────────────────────────────

export type BoxStatus = 'BUILDING' | 'COMPLETE' | 'PAID' | 'FAILED';

export type GiftBox = {
  id: string;
  sessionToken: string;
  userId?: string | null;
  mainSurpriseId?: string | null;
  sweetPickId?: string | null;
  tinyExtraId?: string | null;
  spinRewardId?: string | null;
  status: BoxStatus;
  stripeSessionId?: string | null;
  total?: number | null;
  mainSurprise?: Product | null;
  sweetPick?: Product | null;
  tinyExtra?: Product | null;
  spinReward?: SpinReward | null;
  createdAt: string;
  updatedAt: string;
};

// ── Spin Wheel ────────────────────────────────────────────────────────────────

export type RewardType =
  | 'free_tiny_gift'
  | 'free_shipping'
  | 'upgraded_gift'
  | 'discount_code'
  | 'hidden_item'
  | 'no_reward';

export type SpinReward = {
  id: string;
  type: RewardType;
  label: string;
  value?: string | null;
  createdAt: string;
};

// ── Spin Wheel Segments (for UI) ──────────────────────────────────────────────

export type WheelSegment = {
  type: RewardType;
  label: string;
  color: string;
  emoji: string;
};

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { type: 'free_shipping',  label: 'Free Shipping',    color: '#6C63FF', emoji: '🚚' },
  { type: 'discount_code',  label: '10% Off',          color: '#FF6584', emoji: '💸' },
  { type: 'free_tiny_gift', label: 'Free Gift',        color: '#43E97B', emoji: '🎁' },
  { type: 'hidden_item',    label: 'Secret Item',      color: '#F9CA24', emoji: '✨' },
  { type: 'upgraded_gift',  label: 'Upgrade!',         color: '#FF9F43', emoji: '⬆️' },
  { type: 'no_reward',      label: 'Try Again',        color: '#A29BFE', emoji: '🔄' },
  { type: 'free_shipping',  label: 'Free Shipping',    color: '#6C63FF', emoji: '🚚' },
  { type: 'discount_code',  label: '10% Off',          color: '#FF6584', emoji: '💸' },
];

// ── Pricing ───────────────────────────────────────────────────────────────────

export type PriceBreakdown = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
};

// ── Cart / Box Builder ────────────────────────────────────────────────────────

export type BoxSlotId = 'mainSurprise' | 'sweetPick' | 'tinyExtra';

export type BoxSlot = {
  id: BoxSlotId;
  category: ProductCategory;
  label: string;
  emoji: string;
  description: string;
};

export const BOX_SLOTS: BoxSlot[] = [
  {
    id: 'mainSurprise',
    category: 'main_surprise',
    label: 'Main Surprise',
    emoji: '🎁',
    description: 'The star of the box — the gift that sets the tone.',
  },
  {
    id: 'sweetPick',
    category: 'sweet_pick',
    label: 'Sweet Pick',
    emoji: '🍬',
    description: 'A complementary treat to elevate the experience.',
  },
  {
    id: 'tinyExtra',
    category: 'tiny_extra',
    label: 'Tiny Extra',
    emoji: '✨',
    description: 'A little bonus tucked inside — pure delight.',
  },
];

// ── GEL Formatting ────────────────────────────────────────────────────────────

export function formatGEL(tetri: number): string {
  return new Intl.NumberFormat('ka-GE', {
    style: 'currency',
    currency: 'GEL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(tetri / 100);
}

export function formatGELSimple(tetri: number): string {
  const gel = tetri / 100;
  return `${gel % 1 === 0 ? gel.toFixed(0) : gel.toFixed(2)} ₾`;
}

export function savings(product: Product): number {
  return product.normalPrice - product.boxPrice;
}

export function savingsPct(product: Product): number {
  if (product.normalPrice === 0) return 0;
  return Math.round((savings(product) / product.normalPrice) * 100);
}
