import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, Hash, BookMarked, Star } from "lucide-react";
import { getBookById } from "@/lib/books";
import { listNotesByBook } from "@/lib/notes";
import { listFolders, getFolderIdsForBook } from "@/lib/folders";
import { getSession } from "@/lib/auth";
import { CoverImage } from "@/components/cover-image";
import { BookActions } from "@/components/book-actions";
import { BookDescription } from "@/components/book-description";
import { NoteCard } from "@/components/note-card";
import { Badge } from "@/components/ui";
import { formatDateShort } from "@/lib/utils";

export const metadata: Metadata = { title: "책 상세" };

export const dynamic = "force-dynamic";

export default async function BookDetailPage({
  params,
}: PageProps<"/books/[id]">) {
  const session = await getSession();

  const { id } = await params;
  const [book, notes, selectedFolderIds, userFolders] = await Promise.all([
    getBookById(id),
    listNotesByBook(id),
    getFolderIdsForBook(id),
    session ? listFolders(session.id) : Promise.resolve([]),
  ]);

  if (!book) notFound();

  return (
    <div>
      <Link
        href="/books"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        서재로 돌아가기
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="shrink-0 md:w-52">
          <CoverImage
            thumbnail={book.thumbnail}
            title={book.title}
            className="w-full rounded-xl shadow-book"
          />
          <span className="block text-center text-[11px] text-ink-faint">
            {book.pageCount ? `총 ${book.pageCount}쪽` : ""}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {book.isFavorite ? (
              <Badge className="bg-accent text-white">즐겨찾기</Badge>
            ) : null}
            {book.noteCount ? (
              <Badge className="bg-accent-soft text-accent-deep">
                기록 {book.noteCount}개
              </Badge>
            ) : null}
            {book.averageRating ? (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {book.averageRating.toFixed(1)}
                {book.ratingsCount ? <span className="text-amber-500/70">({book.ratingsCount})</span> : null}
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-2 font-serif text-3xl font-black leading-snug text-ink">
            {book.title}
          </h1>

          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 shrink-0 text-ink-faint" />
              <dt className="text-ink-faint">지은이</dt>
              <dd className="font-medium text-ink">{book.authors || "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 shrink-0 text-ink-faint" />
              <dt className="text-ink-faint">옮긴이</dt>
              <dd className="font-medium text-ink">{book.translator || "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-ink-faint" />
              <dt className="text-ink-faint">출판사</dt>
              <dd className="font-medium text-ink">{book.publisher || "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-ink-faint" />
              <dt className="text-ink-faint">출간일</dt>
              <dd className="font-medium text-ink">
                {book.publishedAt ? formatDateShort(book.publishedAt) : "—"}
              </dd>
            </div>
            {book.isbn ? (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Hash className="h-4 w-4 shrink-0 text-ink-faint" />
                <dt className="text-ink-faint">ISBN</dt>
                <dd className="font-medium text-ink">{book.isbn}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6">
            <BookActions book={book} folders={userFolders} selectedFolderIds={selectedFolderIds} isLoggedIn={!!session} />
          </div>
        </div>
      </div>

      {book.description ? (
        <BookDescription description={book.description} />
      ) : null}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-ink">독서 기록</h2>
          {notes.length === 0 ? null : (
            <span className="text-sm text-ink-faint">{notes.length}개</span>
          )}
        </div>
        {notes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-cream/60 px-6 py-10 text-center text-sm text-ink-soft">
            아직 기록이 없어요.{" "}
            {session ? (
              <Link
                href={`/notes/new?book=${book.id}`}
                className="font-semibold text-accent-deep underline hover:text-accent"
              >
                기록하기
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="font-semibold text-accent-deep underline hover:text-accent"
              >
                로그인하고 기록하기
              </Link>
            )}
            버튼으로 첫 기록을 남겨보세요.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
