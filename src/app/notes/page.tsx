import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotebookPen, Search } from "lucide-react";
import { listNotes } from "@/lib/notes";
import { getSession } from "@/lib/auth";
import { NoteCard } from "@/components/note-card";
import { EmptyState, Button } from "@/components/ui";

export const metadata: Metadata = { title: "기록" };

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const notes = await listNotes(session.id);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black text-ink">기록</h1>
          <p className="mt-1 text-sm text-ink-soft">쌓아온 모든 독서 기록, {notes.length}개</p>
        </div>
        <Link
          href="/notes/new"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-paper transition-all hover:bg-ink/90"
        >
          <NotebookPen className="h-4 w-4" />
          새 기록
        </Link>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<NotebookPen className="h-8 w-8" />}
          title="아직 기록이 없어요"
          description="책 찾기에서 책을 검색하고 기록하기를 누르면 시작돼요."
          action={
            <Link href="/search">
              <Button>
                <Search className="h-4 w-4" />
                책 찾으러 가기
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      )}
    </div>
  );
}
