import { createClient } from "@/lib/supabase/server";
import type { Note, NoteInput, Stats } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapNote(row: any, book?: any, clips?: any[], links?: any[]): Note {
  return {
    id: row.id,
    bookId: row.book_id,
    title: row.title,
    content: row.content,
    rating: row.rating,
    isPublic: !!row.is_public,
    sharePassword: row.share_password ?? null,
    bgColor: row.bg_color,
    bgDark: row.bg_dark ?? 1,
    readDate: row.read_date,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    book: book
      ? {
          id: book.id,
          googleId: book.google_id,
          title: book.title,
          authors: book.authors,
          translator: book.translator,
          publisher: book.publisher,
          publishedAt: book.published_at,
          isbn: book.isbn,
          pageCount: book.page_count,
          thumbnail: book.thumbnail,
          infoLink: book.info_link,
          description: book.description,
          averageRating: book.average_rating,
          ratingsCount: book.ratings_count,
          isFavorite: !!book.is_favorite,
          userId: book.user_id,
          createdAt: book.created_at,
          updatedAt: book.updated_at,
        }
      : undefined,
    clips: clips?.map((c: any) => ({
      id: c.id,
      quote: c.quote,
      page: c.page,
      memo: c.memo,
      createdAt: c.created_at,
    })) ?? [],
    links: links?.map((l: any) => ({
      id: l.id,
      label: l.label,
      url: l.url,
      fileData: l.file_data,
      fileName: l.file_name,
      fileType: l.file_type,
      isFile: !!l.file_data,
      createdAt: l.created_at,
    })) ?? [],
  };
}

async function withBookAndCounts(supabase: Awaited<ReturnType<typeof createClient>>, row: any): Promise<Note> {
  const [bookRes, clipsRes, linksRes] = await Promise.all([
    supabase.from("books").select("*").eq("id", row.book_id).single(),
    supabase.from("clips").select("id").eq("note_id", row.id),
    supabase.from("links").select("id").eq("note_id", row.id),
  ]);
  return mapNote(row, bookRes.data, clipsRes.data ?? [], linksRes.data ?? []);
}

export async function bestNotes(limit = 4): Promise<Note[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!data) return [];
  const results = await Promise.all(data.map((row) => withBookAndCounts(supabase, row)));
  return results;
}

export async function getNoteById(id: string): Promise<Note | null> {
  const supabase = await createClient();
  const { data: note } = await supabase.from("notes").select("*").eq("id", id).single();
  if (!note) return null;

  const [bookRes, clipsRes, linksRes] = await Promise.all([
    supabase.from("books").select("*").eq("id", note.book_id).single(),
    supabase.from("clips").select("*").eq("note_id", id).order("created_at", { ascending: true }),
    supabase.from("links").select("*").eq("note_id", id).order("created_at", { ascending: true }),
  ]);

  return mapNote(note, bookRes.data, clipsRes.data ?? [], linksRes.data ?? []);
}

export async function listNotes(userId: string): Promise<Note[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (!data) return [];
  return Promise.all(data.map((row) => withBookAndCounts(supabase, row)));
}

export async function listNotesByBook(bookId: string, userId?: string): Promise<Note[]> {
  const supabase = await createClient();
  let query = supabase
    .from("notes")
    .select("*")
    .eq("book_id", bookId);
  if (userId) query = query.eq("user_id", userId);
  const { data } = await query.order("created_at", { ascending: false });

  if (!data) return [];
  return Promise.all(data.map((row) => withBookAndCounts(supabase, row)));
}

export async function recentNotes(userId: string, limit = 8): Promise<Note[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!data) return [];
  return Promise.all(data.map((row) => withBookAndCounts(supabase, row)));
}

export async function createNote(userId: string, input: NoteInput): Promise<string> {
  const supabase = await createClient();
  const id = `nt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  const { error } = await supabase.from("notes").insert({
    id,
    user_id: userId,
    book_id: input.bookId,
    title: input.title,
    content: input.content,
    rating: input.rating,
    is_public: input.isPublic,
    share_password: input.sharePassword || null,
    bg_color: input.bgColor,
    bg_dark: input.bgDark ?? 1,
    read_date: input.readDate,
  });

  if (error) throw new Error(error.message);

  // Insert clips
  const validClips = input.clips.filter((c) => c.quote.trim());
  if (validClips.length) {
    await supabase.from("clips").insert(
      validClips.map((c, i) => ({
        id: `cl_${Date.now().toString(36)}_${i}`,
        note_id: id,
        quote: c.quote.trim(),
        page: c.page?.trim() || null,
        memo: c.memo?.trim() || null,
      }))
    );
  }

  // Insert links
  const validLinks = input.links.filter((l) => l.url.trim() || l.fileData);
  if (validLinks.length) {
    await supabase.from("links").insert(
      validLinks.map((l, i) => {
        const isFile = !!l.fileData;
        return {
          id: `lk_${Date.now().toString(36)}_${i}`,
          note_id: id,
          label: l.label?.trim() || null,
          url: isFile ? (l.fileName || "첨부 파일").trim() : l.url.trim(),
          file_data: l.fileData || null,
          file_name: l.fileName || null,
          file_type: l.fileType || null,
        };
      })
    );
  }

  // Update book timestamp
  await supabase.from("books").update({ updated_at: new Date().toISOString() }).eq("id", input.bookId);

  return id;
}

export async function updateNote(id: string, input: NoteInput): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notes")
    .update({
      book_id: input.bookId,
      title: input.title,
      content: input.content,
      rating: input.rating,
      is_public: input.isPublic,
      share_password: input.sharePassword || null,
      bg_color: input.bgColor,
      bg_dark: input.bgDark ?? 1,
      read_date: input.readDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Replace clips
  await supabase.from("clips").delete().eq("note_id", id);
  const validClips = input.clips.filter((c) => c.quote.trim());
  if (validClips.length) {
    await supabase.from("clips").insert(
      validClips.map((c, i) => ({
        id: `cl_${Date.now().toString(36)}_${i}`,
        note_id: id,
        quote: c.quote.trim(),
        page: c.page?.trim() || null,
        memo: c.memo?.trim() || null,
      }))
    );
  }

  // Replace links
  await supabase.from("links").delete().eq("note_id", id);
  const validLinks = input.links.filter((l) => l.url.trim() || l.fileData);
  if (validLinks.length) {
    await supabase.from("links").insert(
      validLinks.map((l, i) => {
        const isFile = !!l.fileData;
        return {
          id: `lk_${Date.now().toString(36)}_${i}`,
          note_id: id,
          label: l.label?.trim() || null,
          url: isFile ? (l.fileName || "첨부 파일").trim() : l.url.trim(),
          file_data: l.fileData || null,
          file_name: l.fileName || null,
          file_type: l.fileType || null,
        };
      })
    );
  }

  await supabase.from("books").update({ updated_at: new Date().toISOString() }).eq("id", input.bookId);
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: note } = await supabase.from("notes").select("book_id").eq("id", id).single();
  await supabase.from("notes").delete().eq("id", id);
  if (note) {
    await supabase.from("books").update({ updated_at: new Date().toISOString() }).eq("id", note.book_id);
  }
}

export async function getStats(userId?: string): Promise<Stats> {
  const supabase = await createClient();
  const userFilter = userId ? { user_id: userId } : {};
  const [booksCount, notesCount, clipsRes, favsCount, pagesRes, ratingsRes] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }).match(userFilter),
    supabase.from("notes").select("id", { count: "exact", head: true }).match(userFilter),
    supabase.from("clips").select("id, notes!inner(user_id)", { count: "exact", head: true }).match(userId ? { "notes.user_id": userId } : {}),
    supabase.from("books").select("id", { count: "exact", head: true }).match({ ...userFilter, is_favorite: true }),
    supabase.from("books").select("page_count").match(userFilter),
    supabase.from("notes").select("rating").match(userFilter).not("rating", "is", null),
  ]);

  const totalPages = (pagesRes.data ?? []).reduce((sum, b: any) => sum + (b.page_count ?? 0), 0);
  const ratings = (ratingsRes.data ?? []).map((n: any) => n.rating).filter(Boolean);
  const ratingAvg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  return {
    books: booksCount.count ?? 0,
    notes: notesCount.count ?? 0,
    clips: clipsRes.count ?? 0,
    favorites: favsCount.count ?? 0,
    totalPages,
    ratingAvg,
  };
}
