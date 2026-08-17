import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Search } from "lucide-react";
import { listFavoriteBooks } from "@/lib/books";
import { getSession } from "@/lib/auth";
import { BookCard } from "@/components/book-card";
import { EmptyState, Button } from "@/components/ui";

export const metadata: Metadata = { title: "즐겨찾기" };

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const books = await listFavoriteBooks(session.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-black text-ink">즐겨찾기</h1>
        <p className="mt-1 text-sm text-ink-soft">다시 보고 싶은 책들, {books.length}권</p>
      </div>

      {books.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="즐겨찾는 책이 없어요"
          description="마음에 드는 책의 하트를 눌러 즐겨찾기에 담아보세요."
          action={
            <Link href="/search">
              <Button>
                <Search className="h-4 w-4" />
                책 찾으러 가기
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
