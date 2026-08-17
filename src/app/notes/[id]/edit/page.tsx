import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { listBooks } from "@/lib/books";
import { getNoteById } from "@/lib/notes";
import { getSession } from "@/lib/auth";
import { NoteEditor } from "@/components/note-editor";

export const metadata: Metadata = { title: "기록 수정" };

export const dynamic = "force-dynamic";

export default async function EditNotePage({ params }: PageProps<"/notes/[id]/edit">) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const [{ books }, note] = await Promise.all([listBooks(session.id, 10000, 0), getNoteById(id)]);
  if (!note) notFound();
  if (note.userId !== session.id) notFound();

  return (
    <div>
      <NoteEditor books={books} note={note} />
    </div>
  );
}
