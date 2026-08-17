import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Library, Search } from "lucide-react";
import { listBooks } from "@/lib/books";
import { getSession } from "@/lib/auth";
import { BookCard } from "@/components/book-card";
import { EmptyState, Button } from "@/components/ui";
import { BooksPagination } from "@/components/books-pagination";

export const metadata: Metadata = { title: "서재" };

export const dynamic = "force-dynamic";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1", 10));
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  const { books, total } = await listBooks(session.id, pageSize, offset);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black text-ink">서재</h1>
          <p className="mt-1 text-sm text-ink-soft">기록을 남긴 책들, 전체 {total}권</p>
        </div>
        <Link
          href="/search"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-paper transition-all hover:bg-ink/90"
        >
          <Search className="h-4 w-4" />
          책 추가
        </Link>
      </div>

      {books.length === 0 ? (
        <EmptyState
          icon={<Library className="h-8 w-8" />}
          title="서재가 비어 있어요"
          description="책 찾기에서 읽은 책을 검색하면 서재에 쌓입니다."
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
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
          <BooksPagination page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
