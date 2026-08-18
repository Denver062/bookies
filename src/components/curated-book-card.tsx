"use client";

import { useRouter } from "next/navigation";
import { saveBookFromSearchAction } from "@/actions/books";
import { CoverImage } from "@/components/cover-image";
import { Spinner } from "@/components/ui";
import type { BookInfo } from "@/lib/types";
import { useState } from "react";
import { PenLine } from "lucide-react";

export function CuratedBookCard({ book }: { book: BookInfo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

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
    <div className="group w-[160px] shrink-0 sm:w-[185px]">
      <div
        className="relative mb-3 aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border border-line bg-ink/5 shadow-sm transition-all group-hover:shadow-lg group-hover:border-accent/30"
        onClick={handleRecord}
      >
        <CoverImage
          thumbnail={book.thumbnail}
          title={book.title}
          className="h-full w-full"
        />
      </div>
      <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-ink sm:text-[15px]">
        {book.title}
      </h3>
      <p className="mt-0.5 truncate text-[12px] text-ink-faint sm:text-[13px]">
        {(book.authors ?? []).join(", ")}
      </p>
      <button
        onClick={handleRecord}
        disabled={busy}
        className="mt-2 inline-flex h-7 items-center gap-1 rounded-md bg-ink/5 px-2.5 text-[11px] font-medium text-ink-soft transition-colors hover:bg-ink/10 disabled:opacity-50"
      >
        {busy ? <Spinner className="h-3 w-3" /> : <PenLine className="h-3 w-3" />}
        {busy ? "…" : "기록하기"}
      </button>
    </div>
  );
}
