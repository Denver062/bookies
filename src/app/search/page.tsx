import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listBooks } from "@/lib/books";
import { getSession } from "@/lib/auth";
import { SearchClient } from "@/components/search-client";

export const metadata: Metadata = { title: "책 찾기" };

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { books: saved } = await listBooks(session.id, 10000, 0);
  const savedByGoogleId = new Map(
    saved.filter((b) => b.googleId).map((b) => [b.googleId as string, b])
  );

  return <SearchClient savedByGoogleId={savedByGoogleId} />;
}
