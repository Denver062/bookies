"use client";

import { useEffect } from "react";
import { BookX } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[bookies error]", error?.message, error?.stack);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
        <BookX className="h-10 w-10" />
      </div>
      <h1 className="font-serif text-3xl font-black text-ink">무언가 잘못됐어요</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        예상치 못한 오류가 발생했어요. 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-ink px-6 text-sm font-semibold text-paper transition-all hover:bg-ink/90"
      >
        다시 시도
      </button>
    </div>
  );
}
