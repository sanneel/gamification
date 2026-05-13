import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { loadGiftSession } from "@/lib/commerce";
import { env } from "@/lib/env";
import { pickWeightedReward, rewardLabel } from "@/lib/rewards";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type SpinBody = {
  sessionId?: string;
};

const MAX_SPINS_PER_IP_PER_HOUR = 20;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SpinBody;

  if (!body.sessionId) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const allowed = await consumeSpinAttempt(request);
  if (!allowed) {
    return NextResponse.json({ error: "Too many spin attempts. Try again later." }, { status: 429 });
  }

  const session = await loadGiftSession(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: "Gift session not found" }, { status: 404 });
  }

  if (session.status !== "active") {
    return NextResponse.json({ error: "Gift session is already completed" }, { status: 409 });
  }

  if (session.wheel_reward) {
    return NextResponse.json(
      { reward: session.wheel_reward, label: rewardLabel(session.wheel_reward), alreadySpun: true },
      { status: 409 }
    );
  }

  const reward = pickWeightedReward();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("gift_sessions")
    .update({ wheel_reward: reward })
    .eq("id", body.sessionId)
    .is("wheel_reward", null)
    .select("wheel_reward")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to save wheel reward" }, { status: 500 });
  }

  return NextResponse.json({ reward: data.wheel_reward, label: rewardLabel(data.wheel_reward) });
}

async function consumeSpinAttempt(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const ipHash = createHash("sha256").update(`${ip}:${env.spinRateLimitSalt()}`).digest("hex");
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);

  const { data } = await supabase
    .from("spin_rate_limits")
    .select("id,attempts")
    .eq("ip_hash", ipHash)
    .eq("window_start", windowStart.toISOString())
    .maybeSingle();

  if (data && data.attempts >= MAX_SPINS_PER_IP_PER_HOUR) {
    return false;
  }

  if (data) {
    await supabase
      .from("spin_rate_limits")
      .update({ attempts: data.attempts + 1 })
      .eq("id", data.id);
    return true;
  }

  await supabase.from("spin_rate_limits").insert({
    ip_hash: ipHash,
    window_start: windowStart.toISOString(),
    attempts: 1
  });

  return true;
}
