import { NextRequest, NextResponse } from "next/server";
import { loadGiftSession } from "@/lib/commerce";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const session = await loadGiftSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Gift session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}
