import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { loadGiftSession, validateProductCategory } from "@/lib/commerce";

type SaveSessionBody = {
  sessionId?: string;
  large_item_id?: string | null;
  medium_item_id?: string | null;
  free_item_id?: string | null;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SaveSessionBody;

  try {
    await Promise.all([
      validateProductCategory(body.large_item_id, "large"),
      validateProductCategory(body.medium_item_id, "medium"),
      validateProductCategory(body.free_item_id, "small")
    ]);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid selection" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const payload = {
    large_item_id: body.large_item_id ?? null,
    medium_item_id: body.medium_item_id ?? null,
    free_item_id: body.free_item_id ?? null,
    status: "active"
  };

  if (body.sessionId) {
    const existing = await loadGiftSession(body.sessionId);
    if (!existing) {
      return NextResponse.json({ error: "Gift session not found" }, { status: 404 });
    }

    if (existing.status !== "active") {
      return NextResponse.json({ error: "Gift session is already completed" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("gift_sessions")
      .update(payload)
      .eq("id", body.sessionId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Unable to save gift session" }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  }

  const { data, error } = await supabase.from("gift_sessions").insert(payload).select("*").single();

  if (error) {
    return NextResponse.json({ error: "Unable to create gift session" }, { status: 500 });
  }

  return NextResponse.json({ session: data }, { status: 201 });
}
