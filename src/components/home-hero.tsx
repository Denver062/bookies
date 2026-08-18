"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

const TRENDING_TAGS = ["불편한 편의점", "아몬드", "돈의 속성", "코스모스", "습관", "기록", "트렌드", " 심리학"];

export function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleTag(tag: string) {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  }

  return (
    <div className="text-center">
      <h1 className="font-serif text-4xl font-black leading-tight text-ink sm:text-5xl">
        읽은 책을 기록하고,<br />
        기록을 발견하세요
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        책을 검색하고 독서 기록을 남겨보세요.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="책 제목, 저자, 키워드 검색..."
            className="h-12 w-full rounded-xl border border-line bg-white pl-12 pr-4 text-sm text-ink shadow-book transition-colors placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
          >
            검색
          </button>
        </div>
      </form>

      <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2">
        {TRENDING_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTag(tag)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:border-accent/40 hover:text-accent-deep"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
