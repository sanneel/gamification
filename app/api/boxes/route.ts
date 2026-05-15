import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function POST() {
  try {
    const res = await fetch(`${API_URL}/boxes`, { method: "POST" });
    if (!res.ok) throw new Error("Backend error");
    const box = await res.json();
    return NextResponse.json(box);
  } catch {
    // Fallback: create a local session token
    const sessionToken = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return NextResponse.json({ sessionToken, status: "BUILDING" });
  }
}
