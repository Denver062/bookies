import Link from "next/link";
import { Search, Sparkles, BookOpen, ClipboardList, TrendingUp } from "lucide-react";
import { bestNotes } from "@/lib/notes";
import { popularBooks, topRatedBooks } from "@/lib/books";
import { NoteCard } from "@/components/note-card";
import { BookCard } from "@/components/book-card";
import { HomeHero } from "@/components/home-hero";
import { BookPreviewCard, BookPreviewSkeleton } from "@/components/book-preview-card";
import { CuratedBookCard } from "@/components/curated-book-card";
import { fetchCuratedBooks, fetchRandomFeaturedBook } from "@/lib/google-books";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function CuratedSection({
  title,
  icon: Icon,
  query,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  query: string;
}) {
  let books;
  try {
    books = await fetchCuratedBooks(query, 6);
  } catch {
    return null;
  }
  if (!books.length) return null;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-accent" />
        <h2 className="font-serif text-xl font-bold text-ink">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {books.map((b) => (
          <CuratedBookCard key={b.googleId} book={b} />
        ))}
      </div>
    </section>
  );
}

async function RandomPreview() {
  let book;
  try {
    book = await fetchRandomFeaturedBook();
  } catch {
    return null;
  }
  if (!book) return null;
  return <BookPreviewCard book={book} />;
}

async function PopularAndTopRated() {
  const [popular, topRated] = await Promise.all([popularBooks(6), topRatedBooks(6)]);

  return (
    <>
      {popular.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-ink">
              <TrendingUp className="h-5 w-5 text-accent" />
              많은 기록이 있는 책
            </h2>
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
            >
              더 찾아보기
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {popular.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      ) : null}

      {topRated.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-ink">
              <Sparkles className="h-5 w-5 text-sand" />
              높은 평점의 책
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {topRated.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

export default async function HomePage() {
  const best = await bestNotes(4);

  return (
    <div>
      <section className="relative overflow-hidden rounded-xl border border-line bg-cream px-6 py-10 text-ink shadow-book sm:px-10 sm:py-14 animate-rise">
        <HomeHero />
      </section>

      <Suspense fallback={<BookPreviewSkeleton />}>
        <section className="mt-8">
          <RandomPreview />
        </section>
      </Suspense>

      <Suspense fallback={null}>
        <CuratedSection
          title="오늘 밤 읽기 좋은 소설"
          icon={BookOpen}
          query="subject:fiction korean"
        />
      </Suspense>

      <Suspense fallback={null}>
        <CuratedSection
          title="마음을 다잡아주는 심리학 책"
          icon={Sparkles}
          query="subject:psychology korean"
        />
      </Suspense>

      <Suspense fallback={null}>
        <CuratedSection
          title="기록과 습관에 대한 책"
          icon={ClipboardList}
          query="intitle:습관 OR intitle:기록"
        />
      </Suspense>

      <Suspense fallback={null}>
        <PopularAndTopRated />
      </Suspense>

      {best.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-ink">
              <ClipboardList className="h-5 w-5 text-leaf" />
              베스트 기록
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {best.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-10">
          <div className="rounded-2xl border-2 border-dashed border-line bg-cream/40 px-6 py-12 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-ink-faint" />
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              아직 작성된 독후감이 없어요.<br />
              내가 읽은 책을 찾아 첫 기록을 남겨보세요!
            </p>
            <Link
              href="/search"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90"
            >
              <Search className="h-4 w-4" />
              책 검색해서 기록하기
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
