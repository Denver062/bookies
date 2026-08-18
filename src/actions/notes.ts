"use server";

import { revalidatePath } from "next/cache";
import { createNote, updateNote, deleteNote, getNoteById } from "@/lib/notes";
import { requireAuth } from "@/lib/auth";
import type { NoteInput } from "@/lib/types";

function sanitize(input: NoteInput): NoteInput {
  return {
    bookId: String(input.bookId || ""),
    title: String(input.title || "").trim().slice(0, 200),
    content: String(input.content || "").slice(0, 50000),
    rating:
      input.rating == null
        ? null
        : Math.max(0.5, Math.min(5, Math.round(Number(input.rating) * 2) / 2)),
    isPublic: !!input.isPublic,
    sharePassword: input.sharePassword?.trim() || null,
    bgColor: input.bgColor || null,
    bgDark:
      typeof input.bgDark === "number"
        ? Math.max(0, Math.min(1, input.bgDark))
        : 1,
    readDate: input.readDate || null,
    clips: (input.clips ?? [])
      .filter((c) => c && typeof c.quote === "string" && c.quote.trim())
      .map((c) => ({
        quote: c.quote.trim(),
        page: c.page?.trim() ? c.page.trim().slice(0, 50) : null,
        memo: c.memo?.trim() ? c.memo.trim() : null,
      })),
    links: (input.links ?? [])
      .filter(
        (l) =>
          l &&
          ((typeof l.url === "string" && l.url.trim()) || !!l.fileData)
      )
      .map((l) => {
        const isFile = !!l.fileData;
        return {
          label: l.label?.trim() ? l.label.trim().slice(0, 100) : null,
          url: isFile
            ? (l.fileName || "첨부 파일").trim().slice(0, 300)
            : l.url.trim().slice(0, 4000),
          fileData: l.fileData || null,
          fileName: l.fileName || null,
          fileType: l.fileType || null,
          isFile,
        };
      }),
  };
}

export async function createNoteAction(input: NoteInput): Promise<{ id: string }> {
  const user = await requireAuth();
  const clean = sanitize(input);
  if (!clean.bookId) throw new Error("책을 선택해 주세요.");
  if (!clean.title) throw new Error("제목을 입력해 주세요.");
  const id = await createNote(user.id, clean);
  revalidatePath("/");
  revalidatePath(`/books/${clean.bookId}`);
  revalidatePath("/notes");
  return { id };
}

export async function updateNoteAction(
  id: string,
  input: NoteInput
): Promise<{ id: string }> {
  const user = await requireAuth();
  const note = await getNoteById(id);
  if (!note) throw new Error("기록을 찾을 수 없습니다.");
  if (note.userId !== user.id) throw new Error("권한이 없습니다.");
  const clean = sanitize(input);
  if (!clean.bookId) throw new Error("책을 선택해 주세요.");
  if (!clean.title) throw new Error("제목을 입력해 주세요.");
  await updateNote(id, clean);
  revalidatePath("/");
  revalidatePath(`/books/${clean.bookId}`);
  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
  return { id };
}

export async function deleteNoteAction(id: string): Promise<{ redirectTo: string }> {
  const user = await requireAuth();
  const note = await getNoteById(id);
  if (!note) throw new Error("기록을 찾을 수 없습니다.");
  if (note.userId !== user.id) throw new Error("권한이 없습니다.");
  await deleteNote(id);
  revalidatePath("/");
  revalidatePath("/notes");
  if (note) revalidatePath(`/books/${note.bookId}`);
  return { redirectTo: note ? `/books/${note.bookId}` : "/" };
}
