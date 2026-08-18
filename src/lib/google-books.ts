import type { BookInfo } from "./types";

const API = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

type GoogleVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    industryIdentifiers?: { type: string; identifier: string }[];
    infoLink?: string;
    averageRating?: number;
    ratingsCount?: number;
  };
};

export async function searchGoogleBooks(
  query: string,
  maxResults = 10,
  langRestrict?: string,
  startIndex = 0,
  publishedAfter?: string
): Promise<{ books: BookInfo[]; total: number }> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
    startIndex: String(startIndex),
    printType: "books",
    projection: "full",
  });
  if (langRestrict) params.set("langRestrict", langRestrict);
  if (publishedAfter) params.set("date", `d${publishedAfter}`);

  if (API_KEY) params.set("key", API_KEY);
  const res = await fetch(`${API}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Google Books API error: ${res.status}`);
  }
  const data = (await res.json()) as { items?: GoogleVolume[]; totalItems?: number };
  const items = data.items ?? [];
  const total = data.totalItems ?? 0;

  const unique = new Map<string, BookInfo>();
  for (const item of items) {
    const v = item.volumeInfo;
    if (!v?.title) continue;
    const title = v.subtitle ? `${v.title}: ${v.subtitle}` : v.title;
    const isbn = v.industryIdentifiers?.find(
      (i) => i.type === "ISBN_13" || i.type === "ISBN_10"
    )?.identifier;
    const info: BookInfo = {
      googleId: item.id,
      title,
      authors: v.authors ?? [],
      translator: detectTranslator(v),
      publisher: v.publisher,
      publishedAt: v.publishedDate,
      isbn,
      pageCount: v.pageCount,
      thumbnail: normalizeImage(v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail),
      infoLink: v.infoLink,
      description: v.description,
      language: v.language,
      averageRating: v.averageRating,
      ratingsCount: v.ratingsCount,
    };
    if (!unique.has(info.googleId)) unique.set(info.googleId, info);
  }
  return { books: Array.from(unique.values()), total };
}

export async function fetchBookById(googleId: string): Promise<BookInfo | null> {
  let url = `${API}/${encodeURIComponent(googleId)}`;
  if (API_KEY) url += `?key=${API_KEY}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const item = (await res.json()) as GoogleVolume;
  const v = item.volumeInfo;
  if (!v?.title) return null;
  const isbn = v.industryIdentifiers?.find(
    (i) => i.type === "ISBN_13" || i.type === "ISBN_10"
  )?.identifier;
  return {
    googleId: item.id,
    title: v.subtitle ? `${v.title}: ${v.subtitle}` : v.title,
    authors: v.authors ?? [],
    publisher: v.publisher,
    publishedAt: v.publishedDate,
    isbn,
    pageCount: v.pageCount,
    thumbnail: normalizeImage(v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail),
    infoLink: v.infoLink,
    description: v.description,
    language: v.language,
    averageRating: v.averageRating,
    ratingsCount: v.ratingsCount,
  };
}

export async function fetchCuratedBooks(
  query: string,
  maxResults = 6
): Promise<BookInfo[]> {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const dateStr = twoYearsAgo.toISOString().slice(0, 4);
  const { books } = await searchGoogleBooks(query, maxResults, "ko", 0, dateStr);
  return books;
}

export async function fetchRandomFeaturedBook(): Promise<BookInfo | null> {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const dateStr = twoYearsAgo.toISOString().slice(0, 4);
  const queries = [
    "subject:fiction korean",
    "subject:self-help korean",
    "subject:psychology korean",
    "subject:essay korean",
    "intitle:기록",
    "subject:literary fiction",
    "subject:philosophy",
  ];
  const q = queries[Math.floor(Math.random() * queries.length)];
  const { books } = await searchGoogleBooks(q, 10, "ko", 0, dateStr);
  if (!books.length) return null;
  return books[Math.floor(Math.random() * books.length)];
}

function normalizeImage(url?: string): string | undefined {
  if (!url) return undefined;
  let u = url.startsWith("http://") ? url.replace("http://", "https://") : url;
  u = u.replace(/&edge=curl/gi, "");
  return u;
}

function detectTranslator(v: GoogleVolume["volumeInfo"]): string | undefined {
  if (!v) return undefined;
  const joined = [v.title, v.subtitle, ...(v.authors ?? [])].join(" ");
  const m = joined.match(/(?:옮김|옮긴이|번역|역)\s*[:：]?\s*([^/|,()（）]{2,30}?)(?:[가-힣]?\s*[.|·]|$)/);
  if (m) return m[1].trim();
  return undefined;
}
