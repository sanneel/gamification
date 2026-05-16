import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const audience = searchParams.get("audience");
  const vibes = searchParams.getAll("vibes");

  try {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (audience) params.set("audience", audience);
    vibes.forEach((v) => params.append("vibes", v));

    const res = await fetch(`${API_URL}/products?${params}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ products: [] }, { status: res.status });
    }

    const products = await res.json();
    return NextResponse.json({ products });
  } catch {
    // NestJS server offline — return empty so frontend falls back to demo data
    return NextResponse.json({ products: [] });
  }
}
