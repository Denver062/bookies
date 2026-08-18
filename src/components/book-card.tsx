"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, PenLine, FileText, FolderPlus, Star } from "lucide-react";
import { toggleFavoriteAction, saveBookFromSearchAction } from "@/actions/books";
import { CoverImage } from "@/components/cover-image";
import { Badge, Spinner } from "@/components/ui";
import type { Book, BookInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BookCard({
  book,
  info,
  className,
  isLoggedIn,
  onAddToFolder,
}: {
  book?: Book;
  info?: BookInfo;
  className?: string;
  isLoggedIn?: boolean;
  onAddToFolder?: (bookId: string) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"fav" | "record" | null>(null);
  const [favorite, setFavorite] = useState(book?.isFavorite ?? false);

  const title = book?.title ?? info?.title ?? "";
  const authors = book?.authors ?? (info?.authors ?? []).join(", ");
  const publisher = book?.publisher ?? info?.publisher;
  const publishedAt = book?.publishedAt ?? info?.publishedAt;
  const thumbnail = book?.thumbnail ?? info?.thumbnail;
  const noteCount = book?.noteCount ?? 0;
  const averageRating = book?.averageRating ?? info?.averageRating;
  const ratingsCount = book?.ratingsCount ?? info?.ratingsCount;

  async function toggleFavorite() {
    if (!book) return;
    setBusy("fav");
    setFavorite(!favorite);
    try {
      await toggleFavoriteAction(book.id);
    } finally {
      setBusy(null);
      router.refresh();
    }
  }

  async function record() {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    if (book) {
      router.push(`/notes/new?book=${book.id}`);
      return;
    }
    if (!info) return;
    setBusy("record");
    try {
      const { id } = await saveBookFromSearchAction(info);
      router.push(`/notes/new?book=${id}`);
    } finally {
      setBusy(null);
    }
  }

  async function navigateToBook() {
    if (book) {
      router.push(`/books/${book.id}`);
      return;
    }
    if (!info) return;
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    setBusy("record");
    try {
      const { id } = await saveBookFromSearchAction(info);
      router.push(`/books/${id}`);
    } finally {
      setBusy(null);
    }
  }

  const inner = (
    <div
      className={cn(
        "group relative flex gap-4 rounded-xl border border-line bg-cream p-4 shadow-book transition-colors hover:border-accent/30",
        className
      )}
    >
      <div className="relative shrink-0 cursor-pointer" onClick={navigateToBook}>
        <CoverImage
          thumbnail={thumbnail}
          title={title}
          className="w-24 h-auto rounded-lg shadow-sm"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={navigateToBook}
            className="text-left font-serif text-[15px] font-bold leading-snug text-ink transition-colors hover:text-accent-deep"
          >
            {title}
          </button>
          {book ? (
            <button
              onClick={toggleFavorite}
              disabled={busy === "fav"}
              aria-label="즐겨찾기"
              className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-accent/10 disabled:opacity-50"
            >
              <Heart
                className={cn(
                  "h-[18px] w-[18px] transition-all",
                  favorite ? "fill-accent text-accent scale-110" : "text-ink-faint"
                )}
              />
            </button>
          ) : null}
        </div>

        <p className="mt-1 text-[13px] font-medium text-ink-soft">{authors}</p>
        <div className="flex items-center gap-2 text-xs text-ink-faint">
          <span>{[publisher, publishedAt].filter(Boolean).join(" · ")}</span>
          {averageRating ? (
            <span className="inline-flex items-center gap-0.5 text-amber-600">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {averageRating.toFixed(1)}
              {ratingsCount ? <span className="text-ink-faint">({ratingsCount})</span> : null}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-3">
          <button
            onClick={record}
            disabled={busy === "record"}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[12px] font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-50"
          >
            {busy === "record" ? <Spinner className="h-3.5 w-3.5" /> : <PenLine className="h-3.5 w-3.5" />}
            {busy === "record" ? "저장 중…" : isLoggedIn ? "기록하기" : "로그인 후 기록"}
          </button>
          {book && book.id && (
            <Link
              href={`/books/${book.id}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              <FileText className="h-3.5 w-3.5" />
              {noteCount > 0 ? `기록 ${noteCount}` : "보기"}
            </Link>
          )}
          {book && onAddToFolder ? (
            <button
              onClick={() => onAddToFolder(book.id)}
              aria-label="폴더에 추가"
              className="ml-auto inline-flex h-8 items-center gap-1 rounded-lg px-2 text-ink-faint transition-colors hover:bg-ink/[0.05] hover:text-ink"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (noteCount > 0 && book) {
    return (
      <div className="relative">
        {inner}
        <Badge className="absolute -right-1 -top-1 bg-accent text-white shadow-sm">
          {noteCount}개의 기록
        </Badge>
      </div>
    );
  }
  return inner;
}
