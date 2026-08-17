import { redirect } from "next/navigation";
import { getSession, getUserStats } from "@/lib/auth";
import { recentNotes } from "@/lib/notes";
import { listFavoriteBooks } from "@/lib/books";
import { NoteCard } from "@/components/note-card";
import { BookCard } from "@/components/book-card";
import { ProfileForm } from "./profile-form";
import { ClipboardList, Quote, Heart } from "lucide-react";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [stats, notes, favorites] = await Promise.all([
    getUserStats(),
    recentNotes(session.id, 4),
    listFavoriteBooks(session.id),
  ]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-xl border border-line bg-ink px-6 py-10 text-paper sm:px-10 animate-rise">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px 250px at 90% 0%, ${session.avatarColor}80, transparent 60%), radial-gradient(400px 200px at 10% 100%, rgba(84,122,149,0.4), transparent 55%)`,
          }}
        />
        <div className="relative flex items-center gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl font-black text-white shadow-lg"
            style={{ background: session.avatarColor }}
          >
            {session.name.slice(0, 1)}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-black">{session.name}</h1>
            <p className="text-sm text-paper/60">{session.email}</p>
          </div>
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "기록", value: stats.notes, icon: ClipboardList },
          { label: "클립", value: stats.clips, icon: Quote },
          { label: "즐겨찾기", value: stats.favorites, icon: Heart },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl border border-line bg-cream px-4 py-4 shadow-book"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-deep">
              <s.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-serif text-2xl font-bold leading-none text-ink">
                {String(s.value)}
              </span>
              <span className="mt-1 block text-xs text-ink-soft">{s.label}</span>
            </span>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-line bg-cream p-6 shadow-book">
        <h2 className="mb-4 font-serif text-lg font-bold text-ink">프로필 수정</h2>
        <ProfileForm name={session.name} email={session.email} />
      </section>

      {favorites.length > 0 ? (
        <section>
          <h2 className="mb-4 font-serif text-lg font-bold text-ink">
            즐겨찾는 책
            <span className="ml-2 text-sm font-normal text-ink-faint">{favorites.length}권</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {favorites.slice(0, 4).map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      ) : null}

      {notes.length > 0 ? (
        <section>
          <h2 className="mb-4 font-serif text-lg font-bold text-ink">
            최근 기록
            <span className="ml-2 text-sm font-normal text-ink-faint">{notes.length}개</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {notes.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
