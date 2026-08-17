"use server";

import { revalidatePath } from "next/cache";
import { createFolder, deleteFolder, addBookToFolder, removeBookFromFolder, getFolderById } from "@/lib/folders";
import { requireAuth } from "@/lib/auth";

export async function createFolderAction(name: string, color: string | null): Promise<{ id: string }> {
  const user = await requireAuth();
  const clean = String(name || "").trim();
  if (!clean) throw new Error("폴더 이름을 입력해 주세요.");
  const id = await createFolder(user.id, clean, color || null);
  revalidatePath("/folders");
  return { id };
}

export async function deleteFolderAction(id: string): Promise<void> {
  const user = await requireAuth();
  const folder = await getFolderById(id);
  if (!folder) throw new Error("폴더를 찾을 수 없습니다.");
  if (folder.userId !== user.id) throw new Error("권한이 없습니다.");
  await deleteFolder(id);
  revalidatePath("/folders");
}

export async function setBookFolderAction(
  bookId: string,
  folderId: string,
  add: boolean
): Promise<void> {
  const user = await requireAuth();
  const folder = await getFolderById(folderId);
  if (!folder) throw new Error("폴더를 찾을 수 없습니다.");
  if (folder.userId !== user.id) throw new Error("권한이 없습니다.");
  if (add) {
    await addBookToFolder(bookId, folderId);
  } else {
    await removeBookFromFolder(bookId, folderId);
  }
  revalidatePath(`/books/${bookId}`);
  revalidatePath("/folders");
  revalidatePath("/books");
}
