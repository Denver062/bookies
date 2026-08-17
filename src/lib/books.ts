import { createClient } from "@/lib/supabase/server";
import type { Book, BookInfo } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

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

export async function listBooks(userId: string, limit = 10, offset = 0): Promise<{ books: Book[]; total: number }> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const books = (data ?? []).map((r) => mapBook(r, 0));
  return { books, total: count ?? 0 };
}

export async function listFavoriteBooks(userId: string): Promise<Book[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .eq("is_favorite", true)
    .order("updated_at", { ascending: false });

  return (data ?? []).map((r) => mapBook(r, 0));
}

export async function getBookById(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  return data ? mapBook(data, 0) : null;
}

export async function getBookByGoogleId(googleId: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("google_id", googleId)
    .maybeSingle();

  return data ? mapBook(data, 0) : null;
}

export async function saveBookFromGoogle(userId: string, info: BookInfo): Promise<Book> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("books")
    .select("id, average_rating, ratings_count")
    .eq("google_id", info.googleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    if (!existing.average_rating && info.averageRating) {
      await supabase
        .from("books")
        .update({
          average_rating: info.averageRating,
          ratings_count: info.ratingsCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }
    const { data } = await supabase.from("books").select("*").eq("id", existing.id).single();
    return mapBook(data!);
  }

  const id = `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const { data } = await supabase
    .from("books")
    .insert({
      id,
      user_id: userId,
      google_id: info.googleId,
      title: info.title,
      authors: (info.authors ?? []).join(", "),
      translator: info.translator ?? null,
      publisher: info.publisher ?? null,
      published_at: info.publishedAt ?? null,
      isbn: info.isbn ?? null,
      page_count: info.pageCount ?? null,
      thumbnail: info.thumbnail ?? null,
      info_link: info.infoLink ?? null,
      description: info.description ?? null,
      average_rating: info.averageRating ?? null,
      ratings_count: info.ratingsCount ?? null,
    })
    .select("*")
    .single();

  return mapBook(data!);
}

export async function setFavorite(bookId: string, favorite: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("books")
    .update({ is_favorite: favorite, updated_at: new Date().toISOString() })
    .eq("id", bookId);
}

export async function deleteBook(bookId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("books").delete().eq("id", bookId);
}

export async function popularBooks(limit = 6): Promise<Book[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => mapBook(r, 0));
}

export async function topRatedBooks(limit = 6): Promise<Book[]> {
  const supabase = await createClient();
  // Use RPC or fallback query — Supabase doesn't support subquery SELECT directly
  // We'll use a simple approach: get books with notes
  const { data } = await supabase
    .from("notes")
    .select("book_id, rating")
    .not("rating", "is", null);

  if (!data?.length) return [];

  // Group by book_id, compute avg rating
  const bookRatings = new Map<string, { sum: number; count: number }>();
  for (const row of data) {
    const entry = bookRatings.get(row.book_id) ?? { sum: 0, count: 0 };
    entry.sum += row.rating;
    entry.count += 1;
    bookRatings.set(row.book_id, entry);
  }

  const sorted = [...bookRatings.entries()]
    .sort((a, b) => b[1].sum / b[1].count - a[1].sum / a[1].count)
    .slice(0, limit)
    .map(([bookId]) => bookId);

  if (!sorted.length) return [];

  const { data: books } = await supabase.from("books").select("*").in("id", sorted);
  const bookMap = new Map((books ?? []).map((b) => [b.id, b]));
  return sorted.map((id) => mapBook(bookMap.get(id)!));
}

export async function updateBookMeta(
  bookId: string,
  meta: Partial<Pick<Book, "title" | "authors" | "translator" | "publisher" | "publishedAt">>
): Promise<void> {
  const supabase = await createClient();
  const update: Record<string, any> = { updated_at: new Date().toISOString() };
  if (meta.title) update.title = meta.title.trim();
  if (meta.authors) update.authors = meta.authors.trim();
  if (meta.translator !== undefined) update.translator = meta.translator?.trim() || null;
  if (meta.publisher !== undefined) update.publisher = meta.publisher?.trim() || null;
  if (meta.publishedAt !== undefined) update.published_at = meta.publishedAt?.trim() || null;

  await supabase.from("books").update(update).eq("id", bookId);
}
