import { NextRequest, NextResponse } from "next/server";
import { searchGoogleBooks } from "@/lib/google-books";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const lang = request.nextUrl.searchParams.get("lang")?.trim();
  const start = parseInt(request.nextUrl.searchParams.get("start") || "0", 10);
  const max = parseInt(request.nextUrl.searchParams.get("max") || "10", 10);
  if (!q) {
    return NextResponse.json({ books: [], total: 0 });
  }
  try {
    const { books, total } = await searchGoogleBooks(q, max, lang || undefined, start);
    return NextResponse.json({ books, total });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "검색에 실패했습니다." },
      { status: 502 }
    );
  }
}
