"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Folder as FolderIcon, FolderPlus, Plus, Trash2, X, ChevronDown } from "lucide-react";
import { createFolderAction, deleteFolderAction } from "@/actions/folders";
import { BookCard } from "@/components/book-card";
import { Button, Input, Label } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Book, Folder } from "@/lib/types";

const COLORS = ["#b25a3a", "#5f7f5a", "#3f5d7a", "#7a5b8f", "#b0853f", "#44605f", "#6b4f3c", "#555e66"];

export function FoldersClient({ initial }: { initial: { folder: Folder; books: Book[] }[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createFolderAction(name, color);
      setName("");
      setCreating(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "폴더 만들기에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(folderId: string) {
    setBusy(true);
    setError(null);
    try {
      await deleteFolderAction(folderId);
      setConfirmDel(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "폴더 삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black text-ink">폴더</h1>
          <p className="mt-1 text-sm text-ink-soft">책을 주제별로 정리해 보세요, {initial.length}개</p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4" />
          새 폴더
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <AnimatePresence>
        {creating ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-6 rounded-2xl border border-line bg-cream p-5 shadow-book">
              <div className="flex items-start justify-between">
                <h2 className="font-serif text-lg font-bold text-ink">새 폴더 만들기</h2>
                <button
                  onClick={() => setCreating(false)}
                  className="rounded-full p-1.5 text-ink-faint hover:bg-ink/[0.05]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label>이름</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && create()}
                    placeholder="예) 2026년 읽을 책, 인문학, 소설"
                    autoFocus
                  />
                </div>
                <div>
                  <Label>색상</Label>
                  <div className="flex items-center gap-1.5">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        aria-label={c}
                        className={cn(
                          "h-7 w-7 rounded-full transition-transform hover:scale-110",
                          color === c && "ring-2 ring-ink ring-offset-2 ring-offset-cream"
                        )}
                        style={{ background: c }}
                      />
                    ))}
                    <button
                      onClick={() => setColor(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-ink-faint hover:text-ink"
                      title="색 없음"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <Button onClick={create} disabled={busy || !name.trim()}>
                  <FolderPlus className="h-4 w-4" />
                  만들기
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {initial.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-cream/60 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent-deep">
            <FolderIcon className="h-7 w-7" />
          </div>
          <p className="font-serif text-lg font-semibold text-ink">폴더를 만들어 보세요</p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-soft">
            서재의 책을 주제별로 담아둘 수 있어요. 책 상세 페이지의 폴더 버튼에서도 담을 수
            있습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {initial.map(({ folder, books }) => {
            const open = openId === folder.id;
            return (
              <motion.section
                key={folder.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-line bg-cream shadow-book"
              >
                <div className="flex items-center gap-3 px-5 py-4">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: folder.color || "#c9b796" }}
                  >
                    <FolderIcon className="h-4.5 w-4.5 text-white" />
                  </span>
                  <h2 className="font-serif text-lg font-bold text-ink">{folder.name}</h2>
                  <span className="text-xs text-ink-faint">{books.length}권</span>

                  <div className="ml-auto flex items-center gap-1">
                    {confirmDel === folder.id ? (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-2 py-1">
                        <span className="text-[11px] text-red-700">폴더를 삭제할까요?</span>
                        <button
                          onClick={() => remove(folder.id)}
                          disabled={busy}
                          className="rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white disabled:opacity-50"
                        >
                          삭제
                        </button>
                        <button
                          onClick={() => setConfirmDel(null)}
                          className="text-[11px] text-ink-soft"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDel(folder.id)}
                        className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="폴더 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setOpenId(open ? null : folder.id)}
                      className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-ink/[0.05]"
                      aria-label="펼치기"
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                      />
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-line px-5 py-4">
                        {books.length === 0 ? (
                          <p className="py-6 text-center text-sm text-ink-soft">
                            아직 담긴 책이 없어요. 책 상세 페이지에서 이 폴더에 담을 수 있어요.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {books.map((b) => (
                              <BookCard key={b.id} book={b} />
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
}
