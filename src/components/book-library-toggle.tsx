"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, PenLine, ExternalLink, Loader2 } from "lucide-react";
import { toggleLibraryAction } from "@/actions/books";
import type { BookInfo } from "@/lib/types";

export function BookLibraryToggle({
  info,
  isLoggedIn,
}: {
  info: BookInfo;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    setBusy(true);
    try {
      const result = await toggleLibraryAction(info);
      setAdded(result.added);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={toggle}
        disabled={busy}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : added ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        {busy ? "처리 중…" : added ? "서재에 추가됨" : "서재에 추가"}
      </button>
      {info.infoLink ? (
        <a
          href={info.infoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <ExternalLink className="h-4 w-4" />
          원문 보기
        </a>
      ) : null}
    </div>
  );
}
