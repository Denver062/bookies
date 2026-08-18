import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, Hash, BookMarked, Star } from "lucide-react";
import { getBookById, getBookByGoogleId } from "@/lib/books";
import { listNotesByBook } from "@/lib/notes";
import { listFolders, getFolderIdsForBook } from "@/lib/folders";
import { getSession } from "@/lib/auth";
import { fetchAladinBook } from "@/lib/aladin";
import { CoverImage } from "@/components/cover-image";
import { BookActions } from "@/components/book-actions";
import { BookDescription } from "@/components/book-description";
import { BookLibraryToggle } from "@/components/book-library-toggle";
import { NoteCard } from "@/components/note-card";
import { Badge } from "@/components/ui";
import { formatDateShort } from "@/lib/utils";
import type { BookInfo } from "@/lib/types";

export const metadata: Metadata = { title: "책 상세" };
export const dynamic = "force-dynamic";

export default async function BookDetailPage({
  params,
}: PageProps<"/books/[id]">) {
  const { id } = await params;
  const session = await getSession();

  // Try DB first
  let book = await getBookById(id);
  let isOwner = !!book && !!session && book.userId === session.id;

  // If not in DB, try by googleId
  if (!book) {
    book = await getBookByGoogleId(id);
    isOwner = !!book && !!session && book.userId === session.id;
  }

  let info: BookInfo | null = null;
  let notes: any[] = [];
  let folders: any[] = [];
  let selectedFolderIds: string[] = [];

  if (book && isOwner) {
    [notes, folders, selectedFolderIds] = await Promise.all([
      listNotesByBook(book.id, session!.id),
      listFolders(session!.id),
      getFolderIdsForBook(book.id),
    ]);
  } else if (!book) {
    // Fetch from Aladin
    info = await fetchAladinBook(id);
    if (!info) notFound();
  }

  // Build display data
  const title = book?.title ?? info?.title ?? "";
  const authors = book?.authors ?? (info?.authors ?? []).join(", ");
  const translator = book?.translator ?? info?.translator;
  const publisher = book?.publisher ?? info?.publisher;
  const publishedAt = book?.publishedAt ?? info?.publishedAt;
  const isbn = book?.isbn ?? info?.isbn;
  const pageCount = book?.pageCount;
  const thumbnail = book?.thumbnail ?? info?.thumbnail;
  const description = book?.description ?? info?.description;
  const averageRating = book?.averageRating ?? info?.averageRating;
  const ratingsCount = book?.ratingsCount ?? info?.ratingsCount;
  const isFavorite = book?.isFavorite ?? false;
  const noteCount = book?.noteCount ?? notes.length;
  const infoLink = book?.infoLink ?? info?.infoLink;

  return (
    <div>
      <Link
        href={isOwner ? "/books" : "/search"}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        {isOwner ? "서재로 돌아가기" : "돌아가기"}
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="shrink-0 md:w-52">
          <CoverImage
            thumbnail={thumbnail}
            title={title}
            className="w-full rounded-xl shadow-book"
          />
          <span className="block text-center text-[11px] text-ink-faint">
            {pageCount ? `총 ${pageCount}쪽` : ""}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isOwner && isFavorite ? (
              <Badge className="bg-accent text-white">즐겨찾기</Badge>
            ) : null}
            {noteCount > 0 ? (
              <Badge className="bg-accent-soft text-accent-deep">
                기록 {noteCount}개
              </Badge>
            ) : null}
            {averageRating ? (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {averageRating.toFixed(1)}
                {ratingsCount ? <span className="text-amber-500/70">({ratingsCount})</span> : null}
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-2 font-serif text-3xl font-black leading-snug text-ink">
            {title}
          </h1>

          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 shrink-0 text-ink-faint" />
              <dt className="text-ink-faint">지은이</dt>
              <dd className="font-medium text-ink">{authors || "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 shrink-0 text-ink-faint" />
              <dt className="text-ink-faint">옮긴이</dt>
              <dd className="font-medium text-ink">{translator || "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-ink-faint" />
              <dt className="text-ink-faint">출판사</dt>
              <dd className="font-medium text-ink">{publisher || "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-ink-faint" />
              <dt className="text-ink-faint">출간일</dt>
              <dd className="font-medium text-ink">
                {publishedAt ? formatDateShort(publishedAt) : "—"}
              </dd>
            </div>
            {isbn ? (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Hash className="h-4 w-4 shrink-0 text-ink-faint" />
                <dt className="text-ink-faint">ISBN</dt>
                <dd className="font-medium text-ink">{isbn}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6">
            {isOwner && book ? (
              <BookActions book={book} folders={folders} selectedFolderIds={selectedFolderIds} />
            ) : info ? (
              <BookLibraryToggle info={info} isLoggedIn={!!session} />
            ) : null}
          </div>
        </div>
      </div>

      {description ? (
        <BookDescription description={description} />
      ) : null}

      {isOwner ? (
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
              <Link
                href={`/notes/new?book=${book!.id}`}
                className="font-semibold text-accent-deep underline hover:text-accent"
              >
                기록하기
              </Link>
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
      ) : null}
    </div>
  );
}
