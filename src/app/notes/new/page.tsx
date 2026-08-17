import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBookById } from "@/lib/books";
import { listBooks } from "@/lib/books";
import { getSession } from "@/lib/auth";
import { NoteEditor } from "@/components/note-editor";

export const metadata: Metadata = { title: "새 기록" };

export const dynamic = "force-dynamic";

export default async function NewNotePage({
  searchParams,
}: PageProps<"/notes/new">) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const params = await searchParams;
  const bookId = typeof params.book === "string" ? params.book : undefined;

  const [{ books }, initialBook] = await Promise.all([
    listBooks(session.id, 10000, 0),
    bookId ? getBookById(bookId) : null,
  ]);

  return (
    <div>
      <NoteEditor books={books} initialBook={initialBook} />
    </div>
  );
}
