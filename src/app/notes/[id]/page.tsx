import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNoteById } from "@/lib/notes";
import { getSession } from "@/lib/auth";
import { NoteView } from "@/components/note-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/notes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const note = await getNoteById(id);
  if (!note) return { title: "기록 없음" };
  return {
    title: note.title,
    description: note.book?.title
      ? `${note.book.title} · ${note.book.authors || ""} · Bookies 독서 기록`
      : "Bookies 독서 기록",
  };
}

export default async function NoteDetailPage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  const note = await getNoteById(id);
  if (!note) notFound();

  if (!note.isPublic) {
    const session = await getSession();
    if (!session || session.id !== note.userId) notFound();
  }

  return <NoteView note={note} />;
}
