"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, PenLine, Trash2, ExternalLink } from "lucide-react";
import { toggleFavoriteAction, deleteBookAction } from "@/actions/books";
import { FolderPicker } from "@/components/folder-picker";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Book, Folder } from "@/lib/types";

export function BookActions({
  book,
  folders,
  selectedFolderIds,
}: {
  book: Book;
  folders: Folder[];
  selectedFolderIds: string[];
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(book.isFavorite);
  const [busy, setBusy] = useState<"fav" | "del" | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  async function toggleFav() {
    setBusy("fav");
    setFavorite(!favorite);
    try {
      await toggleFavoriteAction(book.id);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function del() {
    setBusy("del");
    try {
      await deleteBookAction(book.id);
      router.push("/books");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/notes/new?book=${book.id}`}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-deep"
      >
        <PenLine className="h-4 w-4" />
        기록하기
      </Link>
      <button
        onClick={toggleFav}
        disabled={busy === "fav"}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-medium transition-colors disabled:opacity-50"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all",
            favorite ? "fill-accent text-accent" : "text-ink-soft"
          )}
        />
        {favorite ? "즐겨찾기 해제" : "즐겨찾기"}
      </button>
      <FolderPicker bookId={book.id} folders={folders} selectedIds={selectedFolderIds} />
      {book.infoLink ? (
        <a
          href={book.infoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <ExternalLink className="h-4 w-4" />
          원문 보기
        </a>
      ) : null}

      <div className="ml-auto">
        {confirmDel ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-ink-soft">기록도 함께 삭제돼요. 삭제할까요?</span>
            <Button variant="danger" size="sm" onClick={del} disabled={busy === "del"}>
              {busy === "del" ? "삭제 중…" : "삭제"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDel(false)}>
              취소
            </Button>
          </motion.div>
        ) : (
          <button
            onClick={() => setConfirmDel(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
