import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const res = await fetch(`${API_URL}/boxes/${params.token}`);
    if (!res.ok) return NextResponse.json({ box: null }, { status: res.status });
    const box = await res.json();
    return NextResponse.json(box);
  } catch {
    return NextResponse.json({ box: null });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { token: string } }) {
  if (params.token.startsWith("local-")) {
    // Allow offline — just acknowledge
    const body = await req.json();
    return NextResponse.json({ sessionToken: params.token, ...body });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${API_URL}/boxes/${params.token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return NextResponse.json({ error: "Update failed" }, { status: res.status });
    const box = await res.json();
    return NextResponse.json(box);
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
