import { createClient } from "@/lib/supabase/server";
import type { Book, Folder } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapFolder(row: any, bookCount = 0): Folder {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    userId: row.user_id,
    createdAt: row.created_at,
    bookCount,
  };
}

function mapBook(row: any, noteCount = 0): Book {
  return {
    id: row.id,
    googleId: row.google_id,
    title: row.title,
    authors: row.authors,
    translator: row.translator,
    publisher: row.publisher,
    publishedAt: row.published_at,
    isbn: row.isbn,
    pageCount: row.page_count,
    thumbnail: row.thumbnail,
    infoLink: row.info_link,
    description: row.description,
    averageRating: row.average_rating,
    ratingsCount: row.ratings_count,
    isFavorite: !!row.is_favorite,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    noteCount,
  };
}

export async function listFolders(userId: string): Promise<Folder[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!data) return [];

  // Get book counts for each folder
  const folderIds = data.map((f) => f.id);
  const { data: counts } = await supabase
    .from("book_folders")
    .select("folder_id")
    .in("folder_id", folderIds);

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    countMap.set(row.folder_id, (countMap.get(row.folder_id) ?? 0) + 1);
  }

  return data.map((f) => mapFolder(f, countMap.get(f.id) ?? 0));
}

export async function getFolderById(id: string): Promise<Folder | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("folders").select("*").eq("id", id).single();
  if (!data) return null;

  const { count } = await supabase
    .from("book_folders")
    .select("folder_id", { count: "exact", head: true })
    .eq("folder_id", id);

  return mapFolder(data, count ?? 0);
}

export async function createFolder(userId: string, name: string, color: string | null): Promise<string> {
  const supabase = await createClient();
  const id = `fo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  await supabase.from("folders").insert({
    id,
    user_id: userId,
    name: name.trim(),
    color,
  });

  return id;
}

export async function deleteFolder(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("folders").delete().eq("id", id);
}

export async function listBooksByFolder(folderId: string): Promise<Book[]> {
  const supabase = await createClient();
  const { data: bfData } = await supabase
    .from("book_folders")
    .select("book_id")
    .eq("folder_id", folderId);

  if (!bfData?.length) return [];

  const bookIds = bfData.map((r) => r.book_id);
  const { data } = await supabase
    .from("books")
    .select("*")
    .in("id", bookIds)
    .order("updated_at", { ascending: false });

  return (data ?? []).map((r) => mapBook(r, 0));
}

export async function addBookToFolder(bookId: string, folderId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("book_folders").upsert({ book_id: bookId, folder_id: folderId });
}

export async function removeBookFromFolder(bookId: string, folderId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("book_folders")
    .delete()
    .eq("book_id", bookId)
    .eq("folder_id", folderId);
}

export async function getFolderIdsForBook(bookId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("book_folders")
    .select("folder_id")
    .eq("book_id", bookId);

  return (data ?? []).map((r) => r.folder_id);
}
