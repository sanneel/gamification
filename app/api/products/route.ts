import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { GenderTarget, ProductCategory } from "@/lib/types";

const categories: ProductCategory[] = ["large", "medium", "small", "bonus"];
const genders: GenderTarget[] = ["boy", "girl", "unisex"];

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") as ProductCategory | null;
  const gender = request.nextUrl.searchParams.get("gender") as GenderTarget | null;

  if (category && !categories.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  if (gender && !genders.includes(gender)) {
    return NextResponse.json({ error: "Invalid gender target" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("products")
    .select("id,name,descriptor,price,image,category,gender_target,tag,best_for,is_active")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("price", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  if (gender && gender !== "unisex") {
    query = query.in("gender_target", [gender, "unisex"]);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Unable to load products" }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}
