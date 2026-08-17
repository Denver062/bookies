"use client";

import { useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { exportPdf, exportDocx } from "@/lib/export";
import type { Note } from "@/lib/types";

export function ExportButtons({ note }: { note: Note }) {
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);

  async function doExport(kind: "pdf" | "docx") {
    setBusy(kind);
    try {
      if (kind === "pdf") await exportPdf(note);
      else await exportDocx(note);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => doExport("pdf")}
        disabled={!!busy}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-medium text-ink-soft transition-colors hover:border-accent/40 hover:text-accent-deep disabled:opacity-50"
      >
        {busy === "pdf" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
        PDF로 내보내기
      </button>
      <button
        onClick={() => doExport("docx")}
        disabled={!!busy}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-medium text-ink-soft transition-colors hover:border-accent/40 hover:text-accent-deep disabled:opacity-50"
      >
        {busy === "docx" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
        DOCX로 내보내기
      </button>
    </div>
  );
}
