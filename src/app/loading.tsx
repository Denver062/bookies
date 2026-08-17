import { BookMarked } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32">
      <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
        <BookMarked className="h-7 w-7" />
      </div>
      <p className="animate-pulse text-sm text-ink-soft">페이지를 여는 중…</p>
    </div>
  );
}
