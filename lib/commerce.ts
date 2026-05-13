import type { CheckoutTotal, GiftSession, OrderItem, Product, ProductCategory } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SHIPPING_AMOUNT = 499;

export async function getActiveProduct(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single<Product>();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function validateProductCategory(id: string | null | undefined, category: ProductCategory) {
  if (!id) {
    return null;
  }

  const product = await getActiveProduct(id);
  if (!product || product.category !== category) {
    throw new Error(`Invalid ${category} product selection`);
  }

  return product;
}

export async function loadGiftSession(sessionId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("gift_sessions")
    .select("*")
    .eq("id", sessionId)
    .single<GiftSession>();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function loadCheckoutProducts(session: GiftSession) {
  const [large, medium, free] = await Promise.all([
    validateProductCategory(session.large_item_id, "large"),
    validateProductCategory(session.medium_item_id, "medium"),
    validateProductCategory(session.free_item_id, "small")
  ]);

  if (!large || !medium || !free) {
    throw new Error("Gift box is incomplete");
  }

  return { large, medium, free };
}

export function calculateCheckoutTotal(products: { large: Product; medium: Product; free: Product }, reward: GiftSession["wheel_reward"]): CheckoutTotal {
  const items: OrderItem[] = [
    productToOrderItem(products.large),
    productToOrderItem(products.medium),
    { ...productToOrderItem(products.free), unit_amount: 0 }
  ];

  if (reward === "free_sticker") {
    items.push({
      product_id: "reward-free-sticker",
      name: "Free sticker reward",
      category: "reward",
      quantity: 1,
      unit_amount: 0
    });
  }

  if (reward === "mini_gift") {
    items.push({
      product_id: "reward-mini-gift",
      name: "Mini gift reward",
      category: "reward",
      quantity: 1,
      unit_amount: 0
    });
  }

  const subtotal = products.large.price + products.medium.price;
  const discount = reward === "discount_10" ? Math.round(subtotal * 0.1) : 0;
  const shipping = reward === "free_shipping" ? 0 : SHIPPING_AMOUNT;
  const total = Math.max(0, subtotal - discount + shipping);

  items.push({
    product_id: "shipping",
    name: reward === "free_shipping" ? "Free shipping reward" : "Standard shipping",
    category: "shipping",
    quantity: 1,
    unit_amount: shipping
  });

  return { items, subtotal, discount, shipping, total };
}

function productToOrderItem(product: Product): OrderItem {
  return {
    product_id: product.id,
    name: product.name,
    category: product.category,
    quantity: 1,
    unit_amount: product.price
  };
}
