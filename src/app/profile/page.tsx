import { redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-1/3">
          <div className="sticky top-20 space-y-6">
            <div className="rounded-2xl border border-line bg-cream p-6 dark:bg-cream">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg"
                  style={{ background: session.avatarColor }}
                >
                  {session.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate font-serif text-xl font-black text-ink">{session.name}</h1>
                  <p className="truncate text-sm text-ink-soft">{session.email}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "기록", value: stats.notes, icon: ClipboardList },
                  { label: "클립", value: stats.clips, icon: Quote },
                  { label: "즐겨찾기", value: stats.favorites, icon: Heart },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center rounded-xl border border-line bg-paper py-3 dark:bg-paper">
                    <s.icon className="h-4 w-4 text-accent" />
                    <span className="mt-1 font-serif text-xl font-bold text-ink">{String(s.value)}</span>
                    <span className="text-[11px] text-ink-faint">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <LogoutButton />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-cream p-5 dark:bg-cream">
              <h2 className="mb-3 font-serif text-sm font-bold text-ink">프로필 수정</h2>
              <ProfileForm name={session.name} email={session.email} />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-8">
          {favorites.length > 0 ? (
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-ink">
                <Heart className="h-5 w-5 text-accent" />
                즐겨찾는 책
                <span className="text-sm font-normal text-ink-faint">{favorites.length}권</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {favorites.slice(0, 4).map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-line bg-cream/60 px-6 py-12 text-center dark:bg-cream/40">
              <Heart className="mx-auto mb-3 h-8 w-8 text-ink-faint" />
              <p className="font-serif text-base font-semibold text-ink">아직 즐겨찾는 책이 없어요</p>
              <p className="mt-1 text-sm text-ink-soft">
                책 찾기에서 마음에 드는 책을 즐겨찾기 해보세요.
              </p>
            </section>
          )}

          {notes.length > 0 ? (
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-ink">
                <ClipboardList className="h-5 w-5 text-accent" />
                최근 기록
                <span className="text-sm font-normal text-ink-faint">{notes.length}개</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {notes.map((n) => (
                  <NoteCard key={n.id} note={n} />
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-line bg-cream/60 px-6 py-12 text-center dark:bg-cream/40">
              <ClipboardList className="mx-auto mb-3 h-8 w-8 text-ink-faint" />
              <p className="font-serif text-base font-semibold text-ink">아직 기록이 없어요</p>
              <p className="mt-1 text-sm text-ink-soft">
                책을 검색하고 첫 기록을 남겨보세요.
              </p>
              <Link
                href="/search"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
              >
                책 찾으러 가기
              </Link>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
