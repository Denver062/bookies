"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { saveBookFromSearchAction } from "@/actions/books";
import { CoverImage } from "@/components/cover-image";
import { Spinner } from "@/components/ui";
import type { BookInfo } from "@/lib/types";

export function BookPreviewCard({ book }: { book: BookInfo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const desc = book.description
    ? book.description.length > 120
      ? book.description.slice(0, 120) + "…"
      : book.description
    : "아직 소개가 없습니다.";

  async function handleRecord() {
    setBusy(true);
    try {
      const { id } = await saveBookFromSearchAction(book);
      router.push(`/notes/new?book=${id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-cream p-6 shadow-book sm:flex sm:gap-6">
      <div className="mx-auto mb-4 shrink-0 sm:mx-0 sm:w-32">
        <CoverImage
          thumbnail={book.thumbnail}
          title={book.title}
          className="mx-auto w-28 rounded-lg shadow-sm sm:w-full"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          이 책, 한 번 읽어볼까요?
        </span>
        <h3 className="mt-1 font-serif text-lg font-bold leading-snug text-ink">
          {book.title}
        </h3>
        <p className="mt-1 text-[13px] text-ink-soft">
          {(book.authors ?? []).join(", ")}
          {book.publisher ? ` · ${book.publisher}` : ""}
        </p>
        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
          {desc}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-4">
          <button
            onClick={handleRecord}
            disabled={busy}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-ink px-4 text-[13px] font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-50"
          >
            {busy ? <Spinner className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
            {busy ? "저장 중…" : "이 책 기록 남기기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BookPreviewSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-line bg-cream p-6 sm:flex sm:gap-6">
      <div className="mx-auto mb-4 h-40 w-28 rounded-lg bg-ink/5 sm:mx-0 sm:w-32" />
      <div className="flex-1 space-y-3">
        <div className="h-3 w-20 rounded bg-ink/5" />
        <div className="h-5 w-40 rounded bg-ink/5" />
        <div className="h-3 w-24 rounded bg-ink/5" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full rounded bg-ink/5" />
          <div className="h-3 w-3/4 rounded bg-ink/5" />
        </div>
        <div className="pt-2">
          <div className="h-8 w-28 rounded-lg bg-ink/5" />
        </div>
      </div>
    </div>
  );
}
