import React from "react";
import { Font, Document as RDoc, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Note } from "./types";
import { formatDate, formatDateShort, stripMarkdown } from "./utils";

let fontLoaded = false;

async function ensureKoreanFont() {
  if (fontLoaded) return;
  const res = await fetch("/fonts/NotoSansKR-Regular.ttf");
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  Font.register({
    family: "NotoSansKR",
    fonts: [
      { src: `data:font/truetype;base64,${base64}`, fontWeight: 400 },
      { src: `data:font/truetype;base64,${base64}`, fontWeight: 700 },
    ],
  });
  fontLoaded = true;
}

const s = StyleSheet.create({
  page: { padding: "40px 48px", fontFamily: "NotoSansKR", fontSize: 11, color: "#24201d" },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 12, textAlign: "center", fontFamily: "NotoSansKR" },
  metaRow: { flexDirection: "row", marginBottom: 4, fontSize: 10 },
  metaLabel: { fontWeight: 700, width: 70, color: "#6e6461" },
  metaValue: { flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 8, fontFamily: "NotoSansKR" },
  bodyText: { marginBottom: 8, lineHeight: 1.6, fontSize: 11 },
  clipBox: { marginBottom: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: "#d4cfc9" },
  clipQuote: { fontStyle: "italic", fontSize: 10, marginBottom: 4 },
  clipMeta: { fontSize: 9, color: "#8a857e" },
  linkText: { fontSize: 10, marginBottom: 4, color: "#1a56db" },
  footer: { marginTop: 30, textAlign: "center", fontSize: 9, color: "#96918c" },
});

function metaRows(note: Note): { label: string; value: string }[] {
  const b = note.book;
  return [
    { label: "제목", value: note.title || b?.title || "" },
    { label: "지은이", value: b?.authors || "" },
    { label: "옮긴이", value: b?.translator || "" },
    { label: "출판사", value: b?.publisher || "" },
    { label: "출간일", value: b?.publishedAt ? formatDateShort(b.publishedAt) : "" },
    { label: "읽은 날짜", value: note.readDate ? formatDate(note.readDate) : "" },
    { label: "평점", value: ratingText(note) },
  ].filter((r) => r.value);
}

function ratingText(note: Note): string {
  if (!note.rating) return "";
  return `${"★".repeat(note.rating)}${"☆".repeat(5 - note.rating)} (${note.rating}/5)`;
}

function contentParagraphs(note: Note): string[] {
  return stripMarkdown(note.content)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function NotePdfDoc({ note }: { note: Note }) {
  const meta = metaRows(note);
  const paragraphs = contentParagraphs(note);

  return React.createElement(
    RDoc,
    null,
    React.createElement(
      Page,
      { size: "A4", style: s.page },
      React.createElement(Text, { style: s.title }, note.title || note.book?.title || "독서 기록"),
      ...meta.map((r) =>
        React.createElement(
          View,
          { style: s.metaRow, key: r.label },
          React.createElement(Text, { style: s.metaLabel }, r.label),
          React.createElement(Text, { style: s.metaValue }, r.value)
        )
      ),
      ...(paragraphs.length > 0
        ? [
            React.createElement(Text, { style: s.sectionTitle, key: "h-record" }, "기록"),
            ...paragraphs.map((p, i) =>
              React.createElement(Text, { style: s.bodyText, key: `p-${i}` }, p)
            ),
          ]
        : []),
      ...(note.clips.length > 0
        ? [
            React.createElement(Text, { style: s.sectionTitle, key: "h-clips" }, "중요 내용"),
            ...note.clips.map((clip, i) =>
              React.createElement(
                View,
                { style: s.clipBox, key: `clip-${i}` },
                React.createElement(Text, { style: s.clipQuote }, `${i + 1}. ${clip.quote}`),
                clip.page ? React.createElement(Text, { style: s.clipMeta }, `쪽: ${clip.page}`) : null,
                clip.memo ? React.createElement(Text, { style: s.bodyText }, clip.memo) : null
              )
            ),
          ]
        : []),
      ...(note.links.length > 0
        ? [
            React.createElement(Text, { style: s.sectionTitle, key: "h-links" }, "참고 자료"),
            ...note.links.map((link, i) => {
              const label = link.label || (link.isFile ? link.fileName ?? "첨부 파일" : link.url) || "";
              return React.createElement(
                Text,
                { style: s.linkText, key: `link-${i}` },
                link.isFile ? `📎 ${label}` : `${label} · ${link.url}`
              );
            }),
          ]
        : []),
      React.createElement(Text, { style: s.footer }, `Bookies에서 작성됨 · ${formatDate(note.createdAt)}`)
    )
  );
}

export async function generatePdfBlob(note: Note): Promise<Blob> {
  await ensureKoreanFont();
  const { pdf } = await import("@react-pdf/renderer");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return pdf(React.createElement(NotePdfDoc, { note }) as any).toBlob();
}
