"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Link2,
  Lock,
  Paperclip,
  PenLine,
  Quote,
  Trash2,
} from "lucide-react";
import { deleteNoteAction } from "@/actions/notes";
import { ExportButtons } from "@/components/export-buttons";
import { MarkdownView } from "@/components/markdown-view";
import { CoverImage } from "@/components/cover-image";
import { Badge, Button, Input } from "@/components/ui";
import { formatDate, formatDateShort } from "@/lib/utils";
import type { Note } from "@/lib/types";

export function NoteView({ note }: { note: Note }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const b = note.book;
  const overlayStrength = note.bgColor ? 0.35 + note.bgDark * 0.5 : note.bgDark * 0.8;
  const isPasswordProtected = note.isPublic && !!note.sharePassword;

  function checkPassword() {
    if (passwordInput === note.sharePassword) {
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  async function del() {
    setDeleting(true);
    setDelError(null);
    try {
      const { redirectTo } = await deleteNoteAction(note.id);
      router.push(redirectTo);
    } catch (e) {
      setDelError(e instanceof Error ? e.message : "삭제 중 오류가 발생했습니다.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-line"
      style={{
        background: note.bgColor
          ? `linear-gradient(170deg, ${note.bgColor}, #1a2530)`
          : "linear-gradient(170deg, #2c3947, #1a2530)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,${overlayStrength}), rgba(0,0,0,${
            overlayStrength + 0.18
          }))`,
        }}
      />

      <div className="relative z-10 px-5 py-8 text-white sm:px-10 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href={b ? `/books/${b.id}` : "/notes"}
          className="inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {b ? "책으로 돌아가기" : "기록 목록"}
        </Link>
        <Badge
          className={
            note.isPublic
              ? "border border-white/20 bg-white/10 text-white"
              : "border border-white/20 bg-black/20 text-white/80"
          }
        >
          {note.isPublic ? (note.sharePassword ? <KeyRound className="h-3 w-3" /> : <Globe className="h-3 w-3" />) : <Lock className="h-3 w-3" />}
          {note.isPublic ? (note.sharePassword ? "비밀번호 공유" : "공개") : "비공개"}
        </Badge>
      </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {b ? (
            <div className="shrink-0 md:w-44">
              <CoverImage
                thumbnail={b.thumbnail}
                title={b.title}
                className="w-full rounded-xl shadow-2xl ring-1 ring-white/20"
              />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/70">
                {b ? (
                  <>
                    <span className="font-medium text-white">{b.title}</span>
                    <span>·</span>
                  </>
                ) : null}
                {b?.authors ? <span>{b.authors}</span> : null}
                {b?.translator ? (
                  <>
                    <span>·</span>
                    <span>옮김 {b.translator}</span>
                  </>
                ) : null}
              </div>

              <h1 className="mt-2 font-serif text-3xl font-black leading-snug sm:text-4xl">
                {note.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
                {note.readDate ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(note.readDate)}
                  </span>
                ) : null}
                {b?.publisher ? (
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {b.publisher}
                    {b.publishedAt ? ` · ${formatDateShort(b.publishedAt)}` : ""}
                  </span>
                ) : null}
              </div>

              {note.rating ? (
                <div className="mt-3 text-xl tracking-widest text-amber-300 drop-shadow">
                  {"★".repeat(note.rating)}
                  <span className="text-white/30">{"★".repeat(5 - note.rating)}</span>
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>

      {isPasswordProtected && !unlocked ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-black/25 p-8 backdrop-blur-sm ring-1 ring-white/10">
          <KeyRound className="h-10 w-10 text-white/50" />
          <p className="text-sm font-medium text-white/70">이 기록은 비밀번호로 보호되어 있습니다</p>
          <div className="flex w-full max-w-xs items-center gap-2">
            <div className="relative flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") checkPassword(); }}
                placeholder="비밀번호 입력"
                className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-white/40"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={checkPassword} className="shrink-0">
              확인
            </Button>
          </div>
          {passwordError ? (
            <p className="text-sm text-red-300">비밀번호가 올바르지 않습니다</p>
          ) : null}
        </div>
      ) : (
      <>
      {note.content.trim() ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-8 max-w-none rounded-2xl bg-black/25 p-5 backdrop-blur-sm ring-1 ring-white/10 sm:p-7"
        >
          <MarkdownView content={note.content} />
        </motion.div>
      ) : null}

      {note.clips.length > 0 ? (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mt-8"
        >
          <h2 className="mb-3 flex items-center gap-2 font-serif text-lg font-bold text-white/90">
            <Quote className="h-4.5 w-4.5" />
            중요 내용 클립
            <span className="text-sm font-normal text-white/50">{note.clips.length}</span>
          </h2>
          <div className="space-y-3">
            {note.clips.map((clip, i) => (
              <div
                key={clip.id ?? i}
                className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur-sm"
              >
                <p className="font-serif text-[15px] italic leading-relaxed text-white/95">
                  &ldquo;{clip.quote}&rdquo;
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60">
                  {clip.page ? (
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5">p.{clip.page}</span>
                  ) : null}
                  {clip.memo ? <span>— {clip.memo}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      ) : null}

      {note.links.length > 0 ? (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="mb-3 flex items-center gap-2 font-serif text-lg font-bold text-white/90">
            <Paperclip className="h-4.5 w-4.5" />
            참고 자료
          </h2>
          <div className="flex flex-wrap gap-2">
            {note.links.map((link, i) =>
              link.isFile && link.fileData ? (
                <a
                  key={link.id ?? i}
                  href={link.fileData}
                  download={link.fileName || "attachment"}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-sm text-white/90 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Paperclip className="h-4 w-4" />
                  {link.label || link.fileName || "첨부 파일"}
                </a>
              ) : (
                <a
                  key={link.id ?? i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-xs items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-sm text-white/90 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Link2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{link.label || link.url}</span>
                </a>
              )
            )}
          </div>
        </motion.section>
      ) : null}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.26 }}
        className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5"
      >
        <ExportButtons note={note} />
        <button
          onClick={copyLink}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-medium text-white/85 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "링크 복사됨" : "공유 링크 복사"}
        </button>
        <Link
          href={`/notes/${note.id}/edit`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-medium text-white/85 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <PenLine className="h-3.5 w-3.5" />
          수정
        </Link>

        <div className="ml-auto">
          {delError ? (
            <span className="text-xs text-red-300">{delError}</span>
          ) : null}
          {confirmDel ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">정말 삭제할까요?</span>
              <Button
                variant="danger"
                size="sm"
                onClick={del}
                disabled={deleting}
              >
                {deleting ? "삭제 중…" : "삭제"}
              </Button>
              <button
                onClick={() => setConfirmDel(false)}
                className="text-xs text-white/70 hover:text-white"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          )}
        </div>
      </motion.div>
      </>
      )}
      </div>
    </div>
  );
}
