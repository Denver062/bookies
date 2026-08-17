"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const display = value ?? 0;

  function handleClick(n: number) {
    if (value === n) onChange(n - 0.5);
    else if (value === n - 0.5) onChange(null);
    else onChange(n);
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = display >= n;
        const half = !filled && display >= n - 0.5;

        return (
          <button
            key={n}
            type="button"
            onClick={() => handleClick(n)}
            aria-label={`${n}점`}
            className="group relative rounded-lg p-1 transition-colors hover:scale-105"
          >
            <Star
              className={cn(
                "h-7 w-7",
                filled
                  ? "fill-accent text-accent"
                  : half
                    ? "text-accent/50"
                    : "text-line group-hover:text-accent/40"
              )}
            />
            {half ? (
              <div className="absolute inset-1 w-[calc(50%-4px)] overflow-hidden">
                <Star className="h-7 w-7 fill-accent text-accent" />
              </div>
            ) : null}
          </button>
        );
      })}
      {value ? (
        <span className="ml-1 text-sm font-medium text-accent-deep">{value}/5</span>
      ) : null}
    </div>
  );
}
