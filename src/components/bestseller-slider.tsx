"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useCallback } from "react";

type Bestseller = {
  rank: number;
  title: string;
  author: string;
  publisher: string;
};

export function BestsellerSlider({ books }: { books: Bestseller[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    setScrolled(scrollRef.current.scrollLeft > 10);
  }, []);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 240;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="group/slider relative">
      <button
        onClick={() => scroll("left")}
        className="absolute -left-3 top-[100px] z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-md opacity-0 transition-opacity group-hover/slider:opacity-100 hover:bg-ink/5"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-3 top-[100px] z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-md opacity-0 transition-opacity group-hover/slider:opacity-100 hover:bg-ink/5"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {books.map((book) => (
            <div
              key={book.rank}
              className="group relative w-[150px] shrink-0 sm:w-[175px]"
            >
              <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl border border-line bg-ink/5 shadow-sm transition-all group-hover:shadow-lg group-hover:border-accent/30">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(145deg, hsl(${(book.rank * 41) % 360}, 30%, 78%) 0%, hsl(${(book.rank * 41 + 40) % 360}, 22%, 58%) 100%)`,
                  }}
                />
                <span className="absolute left-2 top-2 z-10 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-ink/80 px-1.5 text-xs font-bold text-paper shadow-sm backdrop-blur-sm">
                  {book.rank}
                </span>
              </div>
              <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink sm:text-base">
                {book.title}
              </h3>
              <p className="mt-1 truncate text-[13px] text-ink-faint sm:text-sm">
                {book.author}
              </p>
            </div>
          ))}
        </div>

        {scrolled && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-paper to-transparent" />
        )}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-paper to-transparent" />
      </div>
    </div>
  );
}
