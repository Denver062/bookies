import Link from "next/link";
import { ArrowRight, ClipboardList, Crown, Search, Star, TrendingUp } from "lucide-react";
import { bestNotes } from "@/lib/notes";
import { popularBooks, topRatedBooks } from "@/lib/books";
import { getSession } from "@/lib/auth";
import { NoteCard } from "@/components/note-card";
import { BookCard } from "@/components/book-card";
import { BestsellerSlider } from "@/components/bestseller-slider";

export const dynamic = "force-dynamic";

const BESTSELLERS = [
  { rank: 1, title: "불편한 편의점 2", author: "김호연", publisher: "나무나무" },
  { rank: 2, title: "아몬드", author: "손원평", publisher: "창비" },
  { rank: 3, title: "코스모스", author: "칼 세이건", publisher: "사이언스북스" },
  { rank: 4, title: "세이노의 가르침", author: "세이노", publisher: "데이원" },
  { rank: 5, title: "역행자", author: "자청", publisher: "리더스북" },
  { rank: 6, title: "돈의 속성", author: "김승호", publisher: "스노우폭스북스" },
  { rank: 7, title: "나의 하루는 4시 30분에 시작된다", author: "유영지", publisher: "위즈덤하우스" },
  { rank: 8, title: "어떻게 말할 것인가", author: "도나 메이크피스", publisher: "위즈덤하우스" },
  { rank: 9, title: "피지컬 100", author: "채널 예능", publisher: "문학동네" },
  { rank: 10, title: "지구 끝의 온실", author: "김초엽", publisher: "허블" },
];

export default async function HomePage() {
  const [session, popular, topRated, best] = await Promise.all([
    getSession(),
    popularBooks(6),
    topRatedBooks(6),
    bestNotes(4),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden rounded-xl border border-line bg-ink px-6 py-8 text-paper shadow-book sm:px-10 sm:py-10 animate-rise">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(600px 250px at 90% 0%, rgba(84,122,149,0.5), transparent 60%), radial-gradient(400px 200px at 10% 100%, rgba(194,165,109,0.4), transparent 55%)",
          }}
        />
        <div className="relative">
          {session ? (
            <>
              <h1 className="max-w-xl font-serif text-3xl font-black leading-snug sm:text-[36px] sm:leading-[1.3]">
                다시 오셨네요, {session.name}님
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-paper/70">
                오늘은 어떤 책을 기록해볼까요?
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/search"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-deep"
                >
                  <Search className="h-4 w-4" />
                  책 찾기
                </Link>
                <Link
                  href="/notes/new"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 text-sm font-semibold text-paper backdrop-blur transition-colors hover:bg-white/20"
                >
                  <ClipboardList className="h-4 w-4" />
                  새 기록
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="max-w-xl font-serif text-3xl font-black leading-snug sm:text-[36px] sm:leading-[1.3]">
                나의 독서가<br />
                한 권씩 쌓여가는 곳
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-paper/70">
                읽은 책을 찾아 기록을 남기고, 중요한 문장을 클립하고,
                평가와 참고 자료를 곁들여 내 프로필에 쌓아보세요.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/register"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-deep"
                >
                  <Search className="h-4 w-4" />
                  시작하기
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 text-sm font-semibold text-paper backdrop-blur transition-colors hover:bg-white/20"
                >
                  로그인
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-ink">
            <Crown className="h-5 w-5 text-amber-500" />
            베스트셀러
          </h2>
          <Link
            href="https://www.aladin.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
          >
            알라딘에서 더 보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <BestsellerSlider books={BESTSELLERS} />
      </section>

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
              더 찾아보기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {popular.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      ) : null}

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
      ) : null}

      {topRated.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-ink">
              <Star className="h-5 w-5 text-sand" />
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
    </div>
  );
}
