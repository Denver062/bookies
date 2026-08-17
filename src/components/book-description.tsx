"use client";

import { useState } from "react";

export function BookDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mt-8 rounded-2xl border border-line bg-cream p-5 shadow-book">
      <h2 className="mb-2 font-serif text-lg font-bold text-ink">책 소개</h2>
      <p
        className={`whitespace-pre-line text-[15px] leading-relaxed text-ink-soft ${expanded ? "" : "line-clamp-4"}`}
      >
        {description}
      </p>
      {description.length > 200 ? (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-medium text-accent-deep hover:underline"
        >
          {expanded ? "접기" : "더 보기"}
        </button>
      ) : null}
    </section>
  );
}
