import type { Metadata } from "next";
import { listBooks } from "@/lib/books";
import { getSession } from "@/lib/auth";
import { SearchClient } from "@/components/search-client";
import type { Book } from "@/lib/types";

export const metadata: Metadata = { title: "책 찾기" };

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const session = await getSession();

  let savedByGoogleId = new Map<string, Book>();
  if (session) {
    const { books: saved } = await listBooks(session.id, 10000, 0);
    savedByGoogleId = new Map(
      saved.filter((b) => b.googleId).map((b) => [b.googleId as string, b])
    );
  }

  return <SearchClient savedByGoogleId={savedByGoogleId} isLoggedIn={!!session} />;
}
