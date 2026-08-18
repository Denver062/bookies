"use client";

import { useRouter } from "next/navigation";
import { saveBookFromSearchAction } from "@/actions/books";
import { CoverImage } from "@/components/cover-image";
import { Spinner } from "@/components/ui";
import type { BookInfo } from "@/lib/types";
import { useState } from "react";

export function CuratedBookCard({ book }: { book: BookInfo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function navigateToDetail() {
    setBusy(true);
    try {
      const { id } = await saveBookFromSearchAction(book);
      router.push(`/books/${id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="group w-[160px] shrink-0 sm:w-[185px]">
      <div
        className="relative mb-3 aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border border-line bg-ink/5 shadow-sm transition-all group-hover:shadow-lg group-hover:border-accent/30"
        onClick={navigateToDetail}
      >
        <CoverImage
          thumbnail={book.thumbnail}
          title={book.title}
          className="h-full w-full"
        />
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/30">
            <Spinner className="h-5 w-5 text-white" />
          </div>
        ) : null}
      </div>
      <h3 className="line-clamp-2 cursor-pointer text-[14px] font-bold leading-snug text-ink transition-colors group-hover:text-accent-deep sm:text-[15px]"
        onClick={navigateToDetail}
      >
        {book.title}
      </h3>
      <p className="mt-0.5 truncate text-[12px] text-ink-faint sm:text-[13px]">
        {(book.authors ?? []).join(", ")}
      </p>
    </div>
  );
}
