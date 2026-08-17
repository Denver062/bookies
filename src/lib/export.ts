import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import type { Note } from "./types";
import { formatDate, formatDateShort, stripMarkdown } from "./utils";

function safeName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
}

function ratingText(note: Note): string {
  if (!note.rating) return "";
  return `${"★".repeat(note.rating)}${"☆".repeat(5 - note.rating)} (${note.rating}/5)`;
}

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

function contentParagraphs(note: Note): string[] {
  return stripMarkdown(note.content)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportPdf(note: Note): Promise<void> {
  const { generatePdfBlob } = await import("./pdf-document");
  const blob = await generatePdfBlob(note);
  downloadBlob(blob, `${safeName(note.title || note.book?.title || "기록")}.pdf`);
}

export async function exportDocx(note: Note): Promise<void> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: note.title || note.book?.title || "독서 기록", bold: true, size: 34 }),
      ],
      spacing: { after: 240 },
    })
  );

  for (const row of metaRows(note)) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${row.label}: `, bold: true }),
          new TextRun(row.value),
        ],
        spacing: { after: 80 },
      })
    );
  }

  children.push(new Paragraph({ spacing: { after: 120 }, text: "" }));

  if (contentParagraphs(note).length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: "기록",
        spacing: { before: 240, after: 120 },
      })
    );
    for (const p of contentParagraphs(note)) {
      children.push(new Paragraph({ text: p, spacing: { after: 140 } }));
    }
  }

  if (note.clips.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: "중요 내용",
        spacing: { before: 240, after: 120 },
      })
    );
    note.clips.forEach((clip, i) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. `, bold: true })],
          spacing: { after: 60 },
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: clip.quote, italics: true })],
          spacing: { after: 60 },
        })
      );
      if (clip.page) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: `쪽: ${clip.page}`, color: "8a857e" })],
            spacing: { after: 60 },
          })
        );
      }
      if (clip.memo) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: clip.memo })],
            spacing: { after: 160 },
          })
        );
      }
    });
  }

  if (note.links.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: "참고 자료",
        spacing: { before: 240, after: 120 },
      })
    );
    for (const link of note.links) {
      const label = link.label || (link.isFile ? link.fileName ?? "첨부 파일" : link.url) || "";
      if (link.isFile) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: `📎 ${label || "첨부 파일"}` })],
            spacing: { after: 80 },
          })
        );
      } else {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun(label ? `${label} · ` : ""),
              new TextRun({ text: link.url, color: "1a56db", underline: {} }),
            ],
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      text: `Bookies에서 작성됨 · ${formatDate(note.createdAt)}`,
      spacing: { before: 400 },
      style: "Subtitle",
    })
  );

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${safeName(note.title || note.book?.title || "기록")}.docx`);
}
