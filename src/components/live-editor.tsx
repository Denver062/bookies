"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Vditor from "vditor";
import { cn } from "@/lib/utils";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  FileCode2,
  Minus,
  Link,
  ImageIcon,
} from "lucide-react";
import "vditor/dist/index.css";

type SlashCmd = {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  insert: string;
  cursor?: number;
  keywords: string[];
};

const SLASH_COMMANDS: (SlashCmd & { category: string })[] = [
  { id: "h1", label: "제목 1", desc: "큰 제목", icon: <Heading1 className="h-4 w-4" />, insert: "# ", category: "기본 블록", keywords: ["heading", "h1", "제목"] },
  { id: "h2", label: "제목 2", desc: "중간 제목", icon: <Heading2 className="h-4 w-4" />, insert: "## ", category: "기본 블록", keywords: ["heading", "h2", "제목"] },
  { id: "h3", label: "제목 3", desc: "작은 제목", icon: <Heading3 className="h-4 w-4" />, insert: "### ", category: "기본 블록", keywords: ["heading", "h3", "제목"] },
  { id: "bold", label: "굵게", desc: "굵은 글씨", icon: <Bold className="h-4 w-4" />, insert: "**", cursor: -1, category: "인라인", keywords: ["bold", "굵게"] },
  { id: "italic", label: "기울임", desc: "기울인 글씨", icon: <Italic className="h-4 w-4" />, insert: "*", cursor: -1, category: "인라인", keywords: ["italic", "기울임"] },
  { id: "strike", label: "취소선", desc: "취소된 글씨", icon: <Strikethrough className="h-4 w-4" />, insert: "~~", cursor: -1, category: "인라인", keywords: ["strike", "취소선"] },
  { id: "code", label: "코드", desc: "인라인 코드", icon: <Code className="h-4 w-4" />, insert: "`", cursor: -1, category: "인라인", keywords: ["code", "코드"] },
  { id: "link", label: "링크", desc: "웹 링크 삽입", icon: <Link className="h-4 w-4" />, insert: "[](url)", cursor: -4, category: "인라인", keywords: ["link", "링크"] },
  { id: "quote", label: "인용", desc: "인용 블록", icon: <Quote className="h-4 w-4" />, insert: "> ", category: "블록", keywords: ["quote", "인용"] },
  { id: "bullet", label: "글머리 목록", desc: "글머리 기호 목록", icon: <List className="h-4 w-4" />, insert: "- ", category: "블록", keywords: ["list", "bullet", "글머리"] },
  { id: "numbered", label: "번호 목록", desc: "번호 매기기 목록", icon: <ListOrdered className="h-4 w-4" />, insert: "1. ", category: "블록", keywords: ["list", "numbered", "번호"] },
  { id: "todo", label: "할 일", desc: "체크박스 목록", icon: <CheckSquare className="h-4 w-4" />, insert: "- [ ] ", category: "블록", keywords: ["todo", "task", "할일", "체크"] },
  { id: "codeblock", label: "코드 블록", desc: "코드 블록 삽입", icon: <FileCode2 className="h-4 w-4" />, insert: "```\n\n```\n", cursor: -4, category: "블록", keywords: ["codeblock", "코드블록"] },
  { id: "hr", label: "수평선", desc: "구분선 삽입", icon: <Minus className="h-4 w-4" />, insert: "---\n", category: "블록", keywords: ["hr", "divider", "수평선", "구분선"] },
  { id: "image", label: "이미지", desc: "이미지 삽입", icon: <ImageIcon className="h-4 w-4" />, insert: "![](url)", cursor: -4, category: "미디어", keywords: ["image", "이미지", "사진"] },
];

export function LiveEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const vditorRef = useRef<Vditor | null>(null);
  const internalUpdate = useRef(false);
  const [ready, setReady] = useState(false);

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const slashStartRef = useRef<number>(-1);
  const slashValueRef = useRef<string>("");

  const filtered = SLASH_COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(slashQuery.toLowerCase()) ||
      c.keywords.some((k) => k.includes(slashQuery.toLowerCase()))
  );

  const flatFiltered = filtered;

  const applySlash = useCallback(
    (cmd: SlashCmd) => {
      const vd = vditorRef.current;
      if (!vd) return;

      const start = slashStartRef.current;
      const val = slashValueRef.current;
      const before = val.substring(0, start);
      const after = val.substring(start + 1 + slashQuery.length);
      const newVal = before + cmd.insert + after;

      internalUpdate.current = true;
      vd.setValue(newVal);
      onChange(newVal);

      setSlashOpen(false);
      setSlashQuery("");
      setSlashIndex(0);
    },
    [onChange, slashQuery]
  );

  const checkSlash = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      if (slashOpen) { setSlashOpen(false); setSlashQuery(""); }
      return;
    }

    const range = sel.getRangeAt(0);
    if (!range.collapsed) {
      if (slashOpen) { setSlashOpen(false); setSlashQuery(""); }
      return;
    }

    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) {
      if (slashOpen) { setSlashOpen(false); setSlashQuery(""); }
      return;
    }

    const text = textNode.textContent ?? "";
    const cursorPos = range.startOffset;
    const beforeCursor = text.substring(0, cursorPos);
    const slashIdx = beforeCursor.lastIndexOf("/");

    if (slashIdx >= 0) {
      const preChar = slashIdx > 0 ? beforeCursor[slashIdx - 1] : "\n";
      if (preChar === " " || preChar === "\n" || slashIdx === 0) {
        const query = beforeCursor.substring(slashIdx + 1);
        if (!query.includes("\n") && query.length <= 20) {
          const rect = range.getBoundingClientRect();
          const containerRect = ref.current!.getBoundingClientRect();
          slashStartRef.current = slashIdx;
          slashValueRef.current = vditorRef.current?.getValue() ?? value;
          setSlashQuery(query);
          setSlashOpen(true);
          setSlashIndex(0);
          setSlashPos({
            top: rect.bottom - containerRect.top + 4,
            left: Math.max(0, rect.left - containerRect.left),
          });
          return;
        }
      }
    }

    if (slashOpen) {
      setSlashOpen(false);
      setSlashQuery("");
    }
  }, [slashOpen, value]);

  useEffect(() => {
    if (!ref.current || vditorRef.current) return;

    const vd = new Vditor(ref.current, {
      mode: "ir",
      placeholder: placeholder ?? "Markdown 문법을 지원해요.",
      height: 440,
      toolbar: [],
      outline: { enable: false, position: "right" },
      cache: { enable: false },
      value,
      input: (v) => {
        internalUpdate.current = true;
        onChange(v);
      },
      theme: "classic",
      after: () => {
        vditorRef.current = vd;
        setReady(true);
      },
    });

    return () => {
      try { vditorRef.current?.destroy(); } catch {}
      vditorRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    const container = ref.current;
    if (!container) return;

    const handleKeyUp = (e: KeyboardEvent) => {
      if (slashOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSlashIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSlashIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === "Enter" && flatFiltered.length > 0) {
          e.preventDefault();
          applySlash(flatFiltered[slashIndex]);
          return;
        }
        if (e.key === "Escape") {
          setSlashOpen(false);
          setSlashQuery("");
          return;
        }
      }

      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        setTimeout(checkSlash, 0);
      } else if (slashOpen) {
        setTimeout(checkSlash, 0);
      }
    };

    const handleClick = () => {
      if (slashOpen) {
        setSlashOpen(false);
        setSlashQuery("");
      }
    };

    container.addEventListener("keyup", handleKeyUp);
    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("keyup", handleKeyUp);
      container.removeEventListener("click", handleClick);
    };
  }, [ready, slashOpen, slashIndex, flatFiltered, applySlash, checkSlash]);

  useEffect(() => {
    if (!ready || internalUpdate.current) {
      if (internalUpdate.current) internalUpdate.current = false;
      return;
    }
    try {
      const vd = vditorRef.current;
      if (vd && vd.getValue() !== value) {
        vd.setValue(value);
      }
    } catch {}
  }, [value, ready]);

  const categories = [...new Set(filtered.map((c) => c.category))];

  return (
    <div className="relative bg-transparent">
      <div ref={ref} className="bg-transparent" />
      {slashOpen && flatFiltered.length > 0 && (
        <div
          className="absolute z-50 w-72 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg"
          style={{ top: slashPos.top, left: slashPos.left }}
        >
          <div className="border-b border-line px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              블록 삽입
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {categories.map((cat) => {
              const catItems = filtered.filter((c) => c.category === cat);
              return (
                <div key={cat}>
                  <div className="px-3 py-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint/70">
                      {cat}
                    </span>
                  </div>
                  {catItems.map((cmd) => {
                    const globalIdx = flatFiltered.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applySlash(cmd);
                        }}
                        onMouseEnter={() => setSlashIndex(globalIdx)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-1.5 text-left transition-colors",
                          globalIdx === slashIndex
                            ? "bg-accent/10"
                            : "hover:bg-cream"
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-cream text-ink-soft">
                          {cmd.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-ink">
                            {cmd.label}
                          </span>
                          <span className="block text-[11px] text-ink-faint">
                            {cmd.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
