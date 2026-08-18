import type { BookInfo } from "./types";

const BASE = "https://www.aladin.co.kr/ttb/api";
const TTB_KEY = process.env.ALADIN_API_KEY;
const VERSION = "20131101";

type AladinItem = {
  title: string;
  author: string;
  pubDate: string;
  description: string;
  isbn: string;
  isbn13: string;
  itemId: number;
  cover: string;
  categoryName: string;
  publisher: string;
  customerReviewRank: number;
  link: string;
};

type AladinResponse = {
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  item: AladinItem[];
};

function mapToBookInfo(item: AladinItem): BookInfo {
  return {
    googleId: `aladin-${item.itemId}`,
    title: item.title,
    authors: item.author
      ? item.author.split(", ").map((a) => a.replace(/\s*\(지은이\)|\s*\(옮긴이\)/g, ""))
      : [],
    translator: item.author.includes("(옮긴이)")
      ? item.author.match(/\(옮긴이\)\s*(.+?)(?:,|$)/)?.[1]?.trim()
      : undefined,
    publisher: item.publisher,
    publishedAt: item.pubDate || undefined,
    isbn: item.isbn13 || item.isbn || undefined,
    thumbnail: item.cover?.replace(/\/compP[568X]\//, "/") || undefined,
    infoLink: item.link,
    description: item.description || undefined,
  };
}

function filterRecent(items: AladinItem[], maxYears = 5): AladinItem[] {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - maxYears);
  const cutoffYear = cutoff.getFullYear();
  return items.filter((item) => {
    if (!item.pubDate || item.pubDate.length < 4) return false;
    const year = parseInt(item.pubDate.slice(0, 4), 10);
    return !isNaN(year) && year >= cutoffYear;
  });
}

async function aladinSearch(
  query: string,
  maxResults: number,
  sort: "Accuracy" | "PublishTime" | "SalesPoint" | "ReviewCount"
): Promise<AladinItem[]> {
  if (!TTB_KEY) throw new Error("ALADIN_API_KEY is not set");

  const params = new URLSearchParams({
    ttbkey: TTB_KEY,
    Query: query,
    QueryType: "Keyword",
    MaxResults: String(maxResults),
    start: "1",
    SearchTarget: "Book",
    Sort: sort,
    output: "js",
    Version: VERSION,
  });

  const res = await fetch(`${BASE}/ItemSearch.aspx?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Aladin API error: ${res.status}`);
  const data = (await res.json()) as AladinResponse;
  return data.item ?? [];
}

export async function fetchCuratedBooks(
  query: string,
  maxResults = 6
): Promise<BookInfo[]> {
  const items = await aladinSearch(query, maxResults * 3, "Accuracy");
  return filterRecent(items).slice(0, maxResults).map(mapToBookInfo);
}

export async function fetchRandomFeaturedBook(): Promise<BookInfo | null> {
  const queries = ["소설", "에세이", "심리학", "자기계발", "철학", "인문학", "과학"];
  const q = queries[Math.floor(Math.random() * queries.length)];
  const items = await aladinSearch(q, 20, "SalesPoint");
  const recent = filterRecent(items).map(mapToBookInfo);
  if (!recent.length) return null;
  return recent[Math.floor(Math.random() * Math.min(recent.length, 5))];
}

export async function searchBooks(
  query: string,
  maxResults = 10
): Promise<{ books: BookInfo[]; total: number }> {
  const items = await aladinSearch(query, maxResults, "Accuracy");
  return { books: items.map(mapToBookInfo), total: items.length };
}
