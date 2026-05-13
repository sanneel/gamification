export type ProductCategory = "large" | "medium" | "small" | "bonus";
export type GenderTarget = "boy" | "girl" | "unisex";
export type GiftSessionStatus = "active" | "completed";
export type OrderStatus = "paid" | "pending" | "failed";

export type Product = {
  id: string;
  name: string;
  descriptor?: string | null;
  price: number;
  image: string;
  category: ProductCategory;
  gender_target: GenderTarget;
  tag?: string | null;
  best_for?: string | null;
  is_active: boolean;
};

export type GiftSession = {
  id: string;
  user_id: string | null;
  large_item_id: string | null;
  medium_item_id: string | null;
  free_item_id: string | null;
  wheel_reward: WheelReward | null;
  status: GiftSessionStatus;
  created_at: string;
  updated_at?: string;
};

export type WheelReward =
  | "free_sticker"
  | "mini_gift"
  | "discount_10"
  | "free_shipping"
  | "no_reward";

export type OrderItem = {
  product_id: string;
  name: string;
  category: ProductCategory | "reward" | "shipping";
  quantity: number;
  unit_amount: number;
};

export type CheckoutTotal = {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
};
