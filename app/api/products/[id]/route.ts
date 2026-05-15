import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${API_URL}/products/${params.id}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return NextResponse.json({ product: null }, { status: res.status });
    const product = await res.json();
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ product: null });
  }
}
