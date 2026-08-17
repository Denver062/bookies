"use client";

import { useState } from "react";
import { BookMarked } from "lucide-react";
import { cn, hexToRgb } from "@/lib/utils";

export function CoverImage({
  thumbnail,
  title,
  color,
  className,
}: {
  thumbnail?: string | null;
  title: string;
  color?: string | null;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (thumbnail && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnail}
        alt={title}
        className={cn("object-contain", className)}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  let bg = "linear-gradient(135deg, #c9b796 0%, #8f6b3f 100%)";
  if (color) {
    const { r, g, b } = hexToRgb(color);
    bg = `linear-gradient(140deg, rgb(${r},${g},${b}) 0%, rgb(${Math.max(0, r - 60)},${Math.max(
      0,
      g - 60
    )},${Math.max(0, b - 60)}) 100%)`;
  }

  return (
    <div
      className={cn("flex aspect-[3/4] items-center justify-center", className)}
      style={{ background: bg }}
    >
      <BookMarked className="h-6 w-6 text-white/70" />
    </div>
  );
}
