"use server";

import { revalidatePath } from "next/cache";
import { saveBookFromGoogle, setFavorite, deleteBook, updateBookMeta, getBookById } from "@/lib/books";
import { requireAuth } from "@/lib/auth";
import type { BookInfo } from "@/lib/types";

export async function saveBookFromSearchAction(info: BookInfo): Promise<{ id: string }> {
  if (!info?.googleId || !info?.title) {
    throw new Error("책 정보가 올바르지 않습니다.");
  }
  const user = await requireAuth();
  const book = await saveBookFromGoogle(user.id, info);
  revalidatePath("/");
  revalidatePath("/books");
  return { id: book.id };
}

export async function toggleFavoriteAction(bookId: string): Promise<{ favorite: boolean }> {
  const user = await requireAuth();
  const book = await getBookById(bookId);
  if (!book) throw new Error("책을 찾을 수 없습니다.");
  if (book.userId !== user.id) throw new Error("권한이 없습니다.");
  await setFavorite(bookId, !book.isFavorite);
  revalidatePath("/");
  revalidatePath("/favorites");
  revalidatePath("/books");
  revalidatePath(`/books/${bookId}`);
  return { favorite: !book.isFavorite };
}

export async function deleteBookAction(bookId: string): Promise<void> {
  const user = await requireAuth();
  const book = await getBookById(bookId);
  if (!book) throw new Error("책을 찾을 수 없습니다.");
  if (book.userId !== user.id) throw new Error("권한이 없습니다.");
  await deleteBook(bookId);
  revalidatePath("/");
  revalidatePath("/favorites");
  revalidatePath("/books");
  revalidatePath("/notes");
}

export async function updateBookMetaAction(
  bookId: string,
  meta: { title?: string; authors?: string; translator?: string; publisher?: string; publishedAt?: string }
): Promise<void> {
  const user = await requireAuth();
  const book = await getBookById(bookId);
  if (!book) throw new Error("책을 찾을 수 없습니다.");
  if (book.userId !== user.id) throw new Error("권한이 없습니다.");
  await updateBookMeta(bookId, meta);
  revalidatePath(`/books/${bookId}`);
  revalidatePath("/notes");
  revalidatePath("/");
}
