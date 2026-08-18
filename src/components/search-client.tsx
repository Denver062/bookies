"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Loader2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { EmptyState, Input } from "@/components/ui";
import type { Book, BookInfo } from "@/lib/types";

const PAGE_SIZE = 10;

const SUGGESTIONS = [
  "자기계발",
  "소설",
  "에세이",
  "역사",
  "과학",
  "심리학",
  "경제",
  "철학",
  "영어 소설",
];

const LANG_FILTERS = [
  { value: "", label: "전체 언어" },
  { value: "ko", label: "한국어" },
  { value: "en", label: "영어" },
];

export function SearchClient({
  savedByGoogleId,
  isLoggedIn,
}: {
  savedByGoogleId?: Map<string, Book>;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("");
  const [results, setResults] = useState<BookInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const queryRef = useRef(query);
  const langRef = useRef(lang);

  async function runSearch(q: string, l: string, start = 0) {
    const trimmed = q.trim();
    if (!trimmed) return;
    queryRef.current = q;
    langRef.current = l;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = new URLSearchParams({ q: trimmed, start: String(start), max: String(PAGE_SIZE) });
      if (l) params.set("lang", l);
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = (await res.json()) as { books?: BookInfo[]; total?: number; error?: string };
      if (!res.ok || data.error) {
        setError(data.error || "검색에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        setResults([]);
        setTotal(0);
      } else {
        setResults(data.books ?? []);
        setTotal(data.total ?? 0);
        setPage(Math.floor(start / PAGE_SIZE));
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  function suggest(q: string) {
    setQuery(q);
    runSearch(q, lang, 0);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <h1 className="font-serif text-3xl font-black text-ink">책 찾기</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          읽은 책을 검색해 서재에 담고, <b className="text-accent-deep">기록하기</b>를 누르면
          제목·지은이·옮긴이·날짜가 자동으로 채워진 기록 화면으로 이동해요.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch(query, lang, 0);
              }}
              placeholder="책 제목이나 지은이로 검색 (예: 채식주의자, 유발 하라리)"
              className="h-12 pl-10 pr-4 text-[15px]"
            />
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="h-12 rounded-xl border border-line bg-cream px-3 text-sm shadow-sm outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
          >
            {LANG_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => runSearch(query, lang, 0)}
            disabled={loading || !query.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            검색
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
            <Sparkles className="h-3.5 w-3.5" />
            추천 검색어:
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => suggest(s)}
              className="rounded-full border border-line bg-cream px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-accent/40 hover:text-accent-deep"
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse gap-4 rounded-2xl border border-line bg-cream p-4"
              >
                <div className="h-32 w-24 rounded-lg bg-ink/5" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 w-3/4 rounded bg-ink/10" />
                  <div className="h-3 w-1/2 rounded bg-ink/5" />
                  <div className="h-3 w-2/3 rounded bg-ink/5" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="검색에 실패했어요"
            description={error}
          />
        ) : searched && results.length === 0 ? (
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title={`"${query}"에 대한 결과가 없어요`}
            description="다른 키워드로 검색하거나 언어 필터를 확인해 보세요."
          />
        ) : results.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-ink-soft">
              <b className="text-ink">{total.toLocaleString()}권</b>의 책을 찾았어요
              <span className="ml-2 text-ink-faint">(페이지 {page + 1}/{totalPages})</span>
            </p>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            >
              {results.map((info) => {
                const saved = info.googleId ? savedByGoogleId?.get(info.googleId) : undefined;
                return (
                  <motion.div
                    key={info.googleId}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
                    }}
                  >
                    <BookCard
                      info={info}
                      book={saved}
                      isLoggedIn={isLoggedIn}
                      onAddToFolder={
                        saved
                          ? (bookId) => router.push(`/books/${bookId}`)
                          : undefined
                      }
                    />
                  </motion.div>
                );
              })}
            </motion.div>

            {totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => runSearch(queryRef.current, langRef.current, (page - 1) * PAGE_SIZE)}
                  disabled={page === 0 || loading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </button>
                <span className="text-sm text-ink-faint">{page + 1} / {totalPages}</span>
                <button
                  onClick={() => runSearch(queryRef.current, langRef.current, (page + 1) * PAGE_SIZE)}
                  disabled={page >= totalPages - 1 || loading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-cream/60 px-6 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent-deep">
              <Search className="h-7 w-7" />
            </div>
            <p className="font-serif text-lg font-semibold text-ink">책을 검색해 보세요</p>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-soft">
              Google Books에서 검색되며, 국내외 도서를 모두 찾을 수 있어요.
              결과에서 <b>기록하기</b>를 누르면 바로 기록을 쓸 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
