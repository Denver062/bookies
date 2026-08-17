import Link from "next/link";
import { Lock, Globe, Quote, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatDateShort, stripMarkdown } from "@/lib/utils";
import type { Note } from "@/lib/types";

export function NoteCard({ note }: { note: Note }) {
  const excerpt =
    stripMarkdown(note.content).slice(0, 140) ||
    (note.clips.length ? `"${note.clips[0].quote.slice(0, 120)}"` : "");

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group flex flex-col rounded-xl border border-line bg-cream p-5 shadow-book transition-colors hover:border-accent/30"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium tracking-wide text-ink-faint">
          {note.book ? note.book.title : ""}
          {note.readDate ? ` · ${formatDateShort(note.readDate)}` : ""}
        </span>
        <span className="text-ink-faint">
          {note.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
        </span>
      </div>

      <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-ink transition-colors group-hover:text-accent-deep">
        {note.title}
      </h3>

      {note.rating ? (
        <div className="mt-1.5 text-[13px] tracking-wide text-accent">
          {"★".repeat(note.rating)}
          <span className="text-ink-faint">{"★".repeat(5 - note.rating)}</span>
        </div>
      ) : null}

      {excerpt ? (
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
          {excerpt}
        </p>
      ) : null}

      <div className="mt-auto flex items-center gap-1.5 pt-3">
        {note.clips.length ? (
          <Badge className="bg-accent-soft text-accent-deep">
            <Quote className="h-3 w-3" />
            {note.clips.length}
          </Badge>
        ) : null}
        {note.links.length ? (
          <Badge className="bg-leaf/10 text-leaf">
            <Paperclip className="h-3 w-3" />
            {note.links.length}
          </Badge>
        ) : null}
        {note.bgColor ? (
          <Badge className="ml-auto border border-black/10 text-ink-soft">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: note.bgColor }}
            />
            배경
          </Badge>
        ) : null}
      </div>
    </Link>
  );
}
