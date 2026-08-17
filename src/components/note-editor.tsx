"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock,
  Paperclip,
  Plus,
  Quote,
  Sparkles,
  Trash2,
  Upload,
  Globe,
  ArrowLeft,
  Palette,
} from "lucide-react";
import { LiveEditor } from "@/components/live-editor";
import { createNoteAction, updateNoteAction } from "@/actions/notes";
import { updateBookMetaAction } from "@/actions/books";
import { Button, Input, Label, Spinner, Textarea } from "@/components/ui";
import { RatingInput } from "@/components/rating-input";
import { cn, extractDominantColor, fileToDataUrl, today } from "@/lib/utils";
import type { Book, Note } from "@/lib/types";

type ClipDraft = { quote: string; page: string; memo: string };
type LinkDraft = {
  label: string;
  url: string;
  isFile: boolean;
  fileName?: string;
  fileData?: string;
  fileType?: string;
};

const PRESETS = [
  "#b25a3a",
  "#5f7f5a",
  "#3f5d7a",
  "#7a5b8f",
  "#b0853f",
  "#8f4a4a",
  "#44605f",
  "#6b4f3c",
  "#a06363",
  "#555e66",
  "#2f2a24",
  "#845f8f",
];

export function NoteEditor({
  books,
  initialBook,
  note,
}: {
  books: Book[];
  initialBook?: Book | null;
  note?: Note | null;
}) {
  const router = useRouter();
  const isEdit = !!note;

  const [bookId, setBookId] = useState(note?.bookId ?? initialBook?.id ?? books[0]?.id ?? "");
  const [title, setTitle] = useState(note?.title ?? initialBook?.title ?? "");
  const [readDate, setReadDate] = useState(note?.readDate ?? today());
  const [rating, setRating] = useState<number | null>(note?.rating ?? null);
  const [content, setContent] = useState(note?.content ?? "");
  const [clips, setClips] = useState<ClipDraft[]>(
    (note?.clips ?? []).map((c) => ({ quote: c.quote, page: c.page ?? "", memo: c.memo ?? "" }))
  );
  const [links, setLinks] = useState<LinkDraft[]>(
    (note?.links ?? []).map((l) => ({
      label: l.label ?? "",
      url: l.url,
      isFile: l.isFile,
      fileName: l.fileName ?? undefined,
      fileData: l.fileData ?? undefined,
    }))
  );
  const [isPublic, setIsPublic] = useState(note?.isPublic ?? false);
  const [sharePassword, setSharePassword] = useState(note?.sharePassword ?? "");
  const [bgColor, setBgColor] = useState<string | null>(note?.bgColor ?? null);
  const [bgDark, setBgDark] = useState<number>(note?.bgDark ?? 0.55);
  const [bookMeta, setBookMeta] = useState({
    title: initialBook?.title ?? "",
    authors: initialBook?.authors ?? "",
    translator: initialBook?.translator ?? "",
    publisher: initialBook?.publisher ?? "",
    publishedAt: initialBook?.publishedAt ?? "",
  });
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bgModal, setBgModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorGen = useRef(0);

  const book = useMemo(
    () => books.find((b) => b.id === bookId) ?? initialBook ?? null,
    [books, bookId, initialBook]
  );

  useEffect(() => {
    if (isEdit) return;
    const isDirty = title.trim() !== (initialBook?.title ?? "") || content.trim() !== "" || clips.some((c) => c.quote.trim()) || links.some((l) => l.url.trim());
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isEdit, title, content, clips, links, initialBook?.title]);

  useEffect(() => {
    if (note || bgColor) return;
    if (book?.thumbnail) {
      const gen = ++colorGen.current;
      (async () => {
        setExtracting(true);
        const c = await extractDominantColor(book!.thumbnail!);
        if (c && colorGen.current === gen) setBgColor(c);
        if (colorGen.current === gen) setExtracting(false);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);

  function selectBook(id: string) {
    const b = books.find((x) => x.id === id);
    if (!b) return;
    setBookId(id);
    setBookMeta({
      title: b.title,
      authors: b.authors,
      translator: b.translator ?? "",
      publisher: b.publisher ?? "",
      publishedAt: b.publishedAt ?? "",
    });
    if (!isEdit && (title === "" || title === (book?.title ?? ""))) {
      setTitle(b.title);
    }
    if (b.thumbnail) {
      const gen = ++colorGen.current;
      (async () => {
        setExtracting(true);
        const c = await extractDominantColor(b.thumbnail!);
        if (c && colorGen.current === gen) setBgColor(c);
        if (colorGen.current === gen) setExtracting(false);
      })();
    }
  }

  async function extractFromCover() {
    if (!book?.thumbnail) return;
    setExtracting(true);
    const c = await extractDominantColor(book.thumbnail);
    if (c) setBgColor(c);
    setExtracting(false);
  }

  function updateClip(i: number, patch: Partial<ClipDraft>) {
    setClips((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function updateLink(i: number, patch: Partial<LinkDraft>) {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  async function handleFile(i: number, file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setError("첨부 파일은 2MB 이하만 가능합니다.");
      return;
    }
    setError(null);
    const dataUrl = await fileToDataUrl(file);
    updateLink(i, {
      isFile: true,
      url: file.name,
      fileName: file.name,
      fileData: dataUrl,
      fileType: file.type || undefined,
      label: file.name,
    });
  }

  async function save() {
    if (!bookId) {
      setError("책을 선택해 주세요.");
      return;
    }
    if (!title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    setBgModal(true);
  }

  async function doSave(overrides?: { bgColor?: string | null; bgDark?: number }) {
    const finalBgColor = overrides?.bgColor ?? bgColor;
    const finalBgDark = overrides?.bgDark ?? bgDark;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        bookId,
        title: title.trim(),
        content,
        rating,
        isPublic,
        sharePassword: sharePassword || null,
        bgColor: finalBgColor,
        bgDark: finalBgDark,
        readDate: readDate || null,
        clips: clips.map((c) => ({
          quote: c.quote,
          page: c.page || null,
          memo: c.memo || null,
        })),
        links: links.map((l) => ({
          label: l.label || null,
          url: l.url,
          isFile: l.isFile,
          fileData: l.fileData,
          fileName: l.fileName,
          fileType: l.fileType ?? null,
        })),
      };

      const b = books.find((x) => x.id === bookId);
      const metaChanged =
        !!b &&
        (bookMeta.title !== b.title ||
          bookMeta.authors !== (b.authors ?? "") ||
          (bookMeta.translator ?? "") !== (b.translator ?? "") ||
          (bookMeta.publisher ?? "") !== (b.publisher ?? "") ||
          (bookMeta.publishedAt ?? "") !== (b.publishedAt ?? ""));
      if (metaChanged) {
        await updateBookMetaAction(bookId, bookMeta);
      }

      const result = isEdit
        ? await updateNoteAction(note!.id, payload)
        : await createNoteAction(payload);
      router.push(`/notes/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 lg:space-y-0">
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 lg:col-span-3"
        >
          {error}
        </motion.div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isEdit ? "기록 수정" : "새 기록 쓰기"}
          className="w-full border-none bg-transparent font-serif text-3xl font-black text-ink outline-none placeholder:text-ink-faint"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 pt-4 lg:grid-cols-[280px_1fr_320px] lg:items-start">
        {/* ── Left: Meta & Actions ── */}
        <aside className="space-y-4 lg:sticky lg:top-20">

          <section className="rounded-xl border border-line bg-cream p-4 shadow-book">
            <Label hint="기록할 책을 선택하세요">책 선택</Label>
            <select
              value={bookId}
              onChange={(e) => selectBook(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm shadow-sm outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>

            {book ? (
              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-ink-soft">지은이</span>
                  <input
                    value={bookMeta.authors}
                    onChange={(e) => setBookMeta({ ...bookMeta, authors: e.target.value })}
                    className="w-full border-none bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-faint"
                    placeholder="지은이"
                  />
                </div>
                <div>
                  <span className="text-xs font-semibold text-ink-soft">옮긴이</span>
                  <input
                    value={bookMeta.translator}
                    onChange={(e) => setBookMeta({ ...bookMeta, translator: e.target.value })}
                    className="w-full border-none bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-faint"
                    placeholder="옮긴이"
                  />
                </div>
                <div>
                  <span className="text-xs font-semibold text-ink-soft">출판사</span>
                  <input
                    value={bookMeta.publisher}
                    onChange={(e) => setBookMeta({ ...bookMeta, publisher: e.target.value })}
                    className="w-full border-none bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-faint"
                    placeholder="출판사"
                  />
                </div>
                <div>
                  <span className="text-xs font-semibold text-ink-soft">출간일</span>
                  <input
                    value={bookMeta.publishedAt}
                    onChange={(e) => setBookMeta({ ...bookMeta, publishedAt: e.target.value })}
                    className="w-full border-none bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-faint"
                    placeholder="출간일"
                  />
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-line bg-cream p-4 shadow-book">
            <div className="space-y-3">
              <div>
                <Label>평점</Label>
                <RatingInput value={rating} onChange={setRating} />
              </div>
              <div>
                <Label>읽은 날짜</Label>
                <Input
                  type="date"
                  value={readDate}
                  onChange={(e) => setReadDate(e.target.value)}
                />
              </div>
            </div>
          </section>

          <div className="space-y-2">
            <Label>공개 설정</Label>
            <div className="flex w-full overflow-hidden rounded-xl border border-line bg-cream p-1">
              {[
                { key: "private", label: "비공개", icon: Lock },
                { key: "password", label: "비밀번호 공유", icon: Lock },
                { key: "public", label: "공개", icon: Globe },
              ].map((opt) => {
                const active =
                  (opt.key === "private" && !isPublic && !sharePassword) ||
                  (opt.key === "password" && isPublic && sharePassword) ||
                  (opt.key === "public" && isPublic && !sharePassword);
                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      if (opt.key === "private") {
                        setIsPublic(false);
                        setSharePassword("");
                      } else if (opt.key === "password") {
                        setIsPublic(true);
                        if (!sharePassword) setSharePassword(" ");
                      } else {
                        setIsPublic(true);
                        setSharePassword("");
                      }
                    }}
                    className={cn(
                      "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-accent text-white" : "text-ink-soft hover:text-ink"
                    )}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {isPublic && sharePassword ? (
              <Input
                type="text"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="mt-2"
              />
            ) : null}
          </div>

          <div className="flex gap-3 lg:flex-col">
            <Button size="lg" onClick={save} disabled={saving} className="lg:w-full">
              {saving ? "저장 중…" : "저장하기"}
            </Button>
            <Button variant="ghost" onClick={() => router.back()} className="lg:w-full">
              취소
            </Button>
          </div>
        </aside>

        {/* ── Middle: Content ── */}
        <main className="space-y-5">
          <section className="rounded-xl border border-line bg-cream p-5 shadow-book">
            <h2 className="mb-3 font-serif text-lg font-bold text-ink">내용</h2>
            <LiveEditor
              value={content}
              onChange={setContent}
              placeholder={"Markdown 문법을 지원해요.\n\n# 소제목\n\n읽으며 남기고 싶은 생각을 자유롭게 적어보세요."}
            />
          </section>
        </main>

        {/* ── Right: Clips & Links ── */}
        <aside className="space-y-5 lg:sticky lg:top-20">
          <section className="rounded-xl border border-line bg-cream p-4 shadow-book">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 font-serif text-sm font-bold text-ink">
                <Quote className="h-4 w-4 text-accent" />
                클립
              </h2>
              <button
                onClick={() => setClips((p) => [...p, { quote: "", page: "", memo: "" }])}
                className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent-deep transition-colors hover:bg-accent/20"
              >
                <Plus className="h-3.5 w-3.5" />
                추가
              </button>
            </div>
            {clips.length === 0 ? (
              <p className="rounded-lg bg-ink/[0.04] px-3 py-5 text-center text-xs text-ink-soft">
                중요한 문장을 인용으로 남겨보세요.
              </p>
            ) : (
              <div className="scrollbar-thin max-h-[480px] space-y-3 overflow-y-auto pr-1">
                {clips.map((clip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-line bg-white p-3"
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-accent-deep">
                        인용 {i + 1}
                      </span>
                      <button
                        onClick={() => setClips((p) => p.filter((_, idx) => idx !== i))}
                        className="rounded p-0.5 text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Textarea
                      rows={2}
                      value={clip.quote}
                      onChange={(e) => updateClip(i, { quote: e.target.value })}
                      placeholder="발췌한 문장"
                    />
                    <div className="mt-1.5 flex gap-1.5">
                      <Input
                        value={clip.page}
                        onChange={(e) => updateClip(i, { page: e.target.value })}
                        placeholder="쪽수"
                        className="w-20 shrink-0"
                      />
                      <Input
                        value={clip.memo}
                        onChange={(e) => updateClip(i, { memo: e.target.value })}
                        placeholder="메모 (선택)"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-line bg-cream p-4 shadow-book">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 font-serif text-sm font-bold text-ink">
                <Paperclip className="h-4 w-4 text-leaf" />
                참고 자료
              </h2>
              <button
                onClick={() => setLinks((p) => [...p, { label: "", url: "", isFile: false }])}
                className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent-deep transition-colors hover:bg-accent/20"
              >
                <Plus className="h-3.5 w-3.5" />
                추가
              </button>
            </div>
            {links.length === 0 ? (
              <p className="rounded-lg bg-ink/[0.04] px-3 py-5 text-center text-xs text-ink-soft">
                관련 URL이나 파일을 추가해 보세요.
              </p>
            ) : (
              <div className="scrollbar-thin max-h-[480px] space-y-3 overflow-y-auto pr-1">
                {links.map((link, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-line bg-white p-3"
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex rounded-md border border-line bg-cream p-0.5">
                        {(
                          [
                            { k: false, label: "URL" },
                            { k: true, label: "파일" },
                          ] as const
                        ).map((o) => (
                          <button
                            key={o.label}
                            onClick={() =>
                              updateLink(i, {
                                isFile: o.k,
                                url: o.k ? link.fileName || "" : "",
                              })
                            }
                            className={cn(
                              "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                              link.isFile === o.k ? "bg-ink text-paper" : "text-ink-soft"
                            )}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setLinks((p) => p.filter((_, idx) => idx !== i))}
                        className="rounded p-0.5 text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Input
                      value={link.label}
                      onChange={(e) => updateLink(i, { label: e.target.value })}
                      placeholder="이름 (선택)"
                      className="mb-1.5"
                    />
                    {link.isFile ? (
                      <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-line bg-cream px-3 text-xs text-ink-soft transition-colors hover:border-accent/40 hover:text-accent-deep">
                        <Upload className="h-3.5 w-3.5" />
                        {link.fileName ? (
                          <span className="flex items-center gap-1 truncate font-medium text-ink">
                            <Paperclip className="h-3 w-3" />
                            {link.fileName}
                          </span>
                        ) : (
                          "파일 선택 (2MB 이하)"
                        )}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFile(i, f);
                          }}
                        />
                      </label>
                    ) : (
                      <Input
                        value={link.url}
                        onChange={(e) => updateLink(i, { url: e.target.value })}
                        placeholder="https://…"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      {bgModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setBgModal(false); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border border-line bg-cream p-6 shadow-lg"
          >
            <h2 className="mb-1 font-serif text-xl font-bold text-ink">배경 설정</h2>
            <p className="mb-5 text-sm text-ink-soft">기록의 배경을 골라주세요.</p>

            <div className="flex flex-col gap-5 md:flex-row">
              <div className="w-full md:w-1/2">
                <Label>미리보기</Label>
                <div className="relative flex h-44 flex-col justify-end overflow-hidden rounded-xl border border-line">
                  <div className="absolute inset-0" style={{
                    background: bgColor
                      ? `linear-gradient(170deg, ${bgColor}, #1a2530)`
                      : "linear-gradient(170deg, #2c3947, #1a2530)",
                  }} />
                  <div className="relative z-10 p-3">
                    <p className="font-serif text-xs font-bold text-white drop-shadow-sm">{title || book?.title}</p>
                    <p className="mt-0.5 text-[10px] text-white/75">{book?.authors || ""}</p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4 md:w-1/2">
                <div>
                  <Label hint="표지의 대표 색을 자동으로 골라요">색상</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {book?.thumbnail ? (
                      <button
                        onClick={extractFromCover}
                        disabled={extracting}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft px-3 text-xs font-medium text-accent-deep transition-colors hover:bg-accent/15 disabled:opacity-60"
                      >
                        {extracting ? <Spinner className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                        표지에서 추출
                      </button>
                    ) : null}
                    <label className="relative inline-block">
                      <span
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-line transition-transform hover:scale-110"
                        style={{ background: bgColor ?? "#547a95" }}
                      >
                        <Palette className="h-3.5 w-3.5 text-white/80 drop-shadow-sm" />
                      </span>
                      <input
                        type="color"
                        value={bgColor ?? "#547a95"}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </label>
                    {PRESETS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setBgColor(c)}
                        className={cn(
                          "h-7 w-7 rounded-full transition-transform hover:scale-110",
                          bgColor === c && "ring-2 ring-ink ring-offset-2 ring-offset-cream"
                        )}
                        style={{ background: c }}
                      />
                    ))}
                    {bgColor ? (
                      <button
                        onClick={() => setBgColor(null)}
                        className="rounded-full p-1.5 text-ink-faint hover:bg-ink/[0.06]"
                        title="색상 끄기"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div>
                  <Label>어둡게</Label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={bgDark}
                    onChange={(e) => setBgDark(Number(e.target.value))}
                    className="w-full accent-[--color-accent]"
                  />
                  <div className="flex justify-between text-[11px] text-ink-faint">
                    <span>밝게</span>
                    <span>어둡게</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button size="lg" onClick={() => { setBgModal(false); doSave(); }} disabled={saving} className="flex-1">
                {saving ? "저장 중…" : "저장하기"}
              </Button>
              <Button variant="ghost" onClick={() => { setBgModal(false); doSave({ bgDark: 0.75 }); }} className="flex-1">
                나중에
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
