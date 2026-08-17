"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, X, Folder as FolderIcon } from "lucide-react";
import { setBookFolderAction } from "@/actions/folders";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Folder } from "@/lib/types";

export function FolderPicker({
  bookId,
  folders,
  selectedIds,
}: {
  bookId: string;
  folders: Folder[];
  selectedIds: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  async function toggle(folderId: string, selected: boolean) {
    setPending(folderId);
    try {
      await setBookFolderAction(bookId, folderId, !selected);
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <FolderPlus className="h-4 w-4" />
        폴더
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="w-full max-w-sm rounded-xl bg-cream p-5 shadow-book"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-ink">폴더에 담기</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 text-ink-faint hover:bg-ink/[0.05]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {folders.length === 0 ? (
                <p className="rounded-xl bg-ink/[0.04] px-4 py-6 text-center text-sm text-ink-soft">
                  아직 폴더가 없어요.{" "}
                  <span className="font-medium text-accent-deep">폴더</span> 페이지에서 만들어 보세요.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {folders.map((f) => {
                    const selected = selectedIds.includes(f.id);
                    return (
                      <li key={f.id}>
                        <button
                          onClick={() => toggle(f.id, selected)}
                          disabled={pending === f.id}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors disabled:opacity-50",
                            selected
                              ? "border-accent/40 bg-accent-soft/60 text-accent-deep"
                              : "border-line bg-white hover:border-accent/30"
                          )}
                        >
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg"
                            style={{ background: f.color || "#c9b796" }}
                          >
                            <FolderIcon className="h-4 w-4 text-white" />
                          </span>
                          <span className="text-sm font-medium">{f.name}</span>
                          <span className="ml-auto text-xs text-ink-faint">
                            {selected ? "담김" : `${f.bookCount ?? 0}권`}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
