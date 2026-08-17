import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "..", "data", "bookies.db");
const dir = path.dirname(dbPath);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    googleId TEXT UNIQUE,
    title TEXT NOT NULL,
    authors TEXT NOT NULL DEFAULT '',
    translator TEXT,
    publisher TEXT,
    publishedAt TEXT,
    isbn TEXT,
    pageCount INTEGER,
    thumbnail TEXT,
    infoLink TEXT,
    description TEXT,
    isFavorite INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    bookId TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    rating INTEGER,
    isPublic INTEGER NOT NULL DEFAULT 0,
    bgColor TEXT,
    bgDark REAL NOT NULL DEFAULT 0.55,
    readDate TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS clips (
    id TEXT PRIMARY KEY,
    noteId TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    quote TEXT NOT NULL,
    page TEXT,
    memo TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    noteId TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    label TEXT,
    url TEXT NOT NULL,
    fileData TEXT,
    fileName TEXT,
    fileType TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS book_folders (
    bookId TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    folderId TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    PRIMARY KEY (bookId, folderId)
  );
`);

const count = db.prepare("SELECT COUNT(*) as c FROM books").get().c;
if (count > 0) {
  console.log("DB에 이미 데이터가 있어요. (시드 건너뜀)");
  process.exit(0);
}

const uid = (p) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const now = new Date().toISOString();

const insertBook = db.prepare(`INSERT INTO books
  (id, googleId, title, authors, translator, publisher, publishedAt, isbn, pageCount, thumbnail, infoLink, description, isFavorite, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertNote = db.prepare(`INSERT INTO notes
  (id, bookId, title, content, rating, isPublic, bgColor, bgDark, readDate, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertClip = db.prepare(`INSERT INTO clips (id, noteId, quote, page, memo, createdAt) VALUES (?, ?, ?, ?, ?, ?)`);
const insertLink = db.prepare(`INSERT INTO links (id, noteId, label, url, fileData, fileName, fileType, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
const insertFolder = db.prepare(`INSERT INTO folders (id, name, color, createdAt) VALUES (?, ?, ?, ?)`);
const insertBF = db.prepare(`INSERT OR IGNORE INTO book_folders (bookId, folderId) VALUES (?, ?)`);

const samples = [
  {
    book: {
      googleId: "seed-001",
      title: "한 권으로 읽는 컴퓨터 구조와 프로그래밍",
      authors: "조너선 스타인하트",
      translator: "오현석",
      publisher: "책만",
      publishedAt: "2022-01-15",
      isbn: "9791162245594",
      pageCount: 496,
      thumbnail: null,
      infoLink: null,
      description: "프로그래머라면 알아야 할 컴퓨터 하드웨어와 소프트웨어의 동작 원리를 쉽게 풀어낸 책.",
      isFavorite: 1,
    },
    notes: [
      {
        title: "컴퓨터가 도대체 뭘 어떻게 하는 건지",
        readDate: "2024-05-02",
        rating: 5,
        isPublic: 1,
        bgColor: "#3f5d7a",
        bgDark: 0.6,
        content: `# 좋았던 점\n\n컴퓨터가 실제로 무슨 일을 하는지 **밑바닥부터** 설명해줘서 머릿속이 정리됐다.\n\n- 1~2장: 전기와 논리 게이트의 연결\n- 3장: 메모리와 CPU의 역할 분담\n\n# 배운 것\n\n> 하드웨어가 빠르지만 멍청하고, 소프트웨어가 느리지만 똑똑하다.\n\n저수준 지식이 부족할수록 읽어야 할 책.`,
        clips: [
          { quote: "하드웨어는 빠르지만 멍청하고, 소프트웨어는 느리지만 똑똑하다.", page: "38쪽", memo: "두 영역이 만나는 지점이 결국 컴퓨터의 전부." },
          { quote: "레이턴시가 모든 것을 결정한다. CPU는 메모리에서 데이터가 오기를 기다리는 시간이 대부분이다.", page: "214쪽", memo: "캐시의 중요성" },
        ],
        links: [
          { label: "저자 웹사이트", url: "https://www.example.com" },
          { label: "용어 정리 노트", url: "https://www.example.com/terms" },
        ],
      },
    ],
  },
  {
    book: {
      googleId: "seed-002",
      title: "여행의 이유",
      authors: "김영하",
      translator: null,
      publisher: "문학동네",
      publishedAt: "2019-04-30",
      isbn: "9788954672203",
      pageCount: 284,
      thumbnail: null,
      infoLink: null,
      description: "김영하 작가가 아이슬란드 여행을 통해 삶과 글쓰기를 돌아보는 산문집.",
      isFavorite: 1,
    },
    notes: [
      {
        title: "낯선 곳에서 나를 만나다",
        readDate: "2024-06-15",
        rating: 4,
        isPublic: 1,
        bgColor: "#44605f",
        bgDark: 0.55,
        content: `여행이 곧 **글쓰기**와 닮아 있다는 이야기가 인상적이었다.\n\n> 나는 여행을 가는 것이 아니라, 여행이 나에게 오기를 기다린다.\n\n바쁜 일상에서 잠시 멈추고 싶을 때 다시 펼치고 싶은 책.`,
        clips: [
          { quote: "낯선 곳에서는 내가 어떤 사람인지 조금씩 드러난다.", page: "72쪽", memo: null },
        ],
        links: [],
      },
    ],
  },
  {
    book: {
      googleId: "seed-003",
      title: "우리는 다시 만나기 위해 헤어지는 것일까",
      authors: "프레데릭 벅먼",
      translator: "최민우",
      publisher: "다산북스",
      publishedAt: "2021-11-10",
      isbn: "9791130640374",
      pageCount: 320,
      thumbnail: null,
      infoLink: null,
      description: "사람들의 관계를 따뜻한 시선으로 그려낸 에세이.",
      isFavorite: 0,
    },
    notes: [
      {
        title: "관계에 대한 따뜻한 문장들",
        readDate: "2024-07-20",
        rating: 4,
        isPublic: 0,
        bgColor: "#b25a3a",
        bgDark: 0.5,
        content: `이별과 만남을 단순하게 받아들이는 태도가 좋았다.\n\n- 잠깐 멈추고 싶을 때 읽는 한 조각\n- 감정을 정리하는 데 도움`,
        clips: [
          { quote: "우리는 이별을 준비하는 것이 아니라, 다음 만남을 준비하는 것이다.", page: "101쪽", memo: "위로가 되는 문장" },
        ],
        links: [],
      },
    ],
  },
];

const folders = [
  { name: "기술서", color: "#3f5d7a" },
  { name: "문학", color: "#b25a3a" },
];
const folderIds = [];
for (const f of folders) {
  const fid = uid("fo");
  insertFolder.run(fid, f.name, f.color, now);
  folderIds.push({ name: f.name, id: fid });
}

samples.forEach((sample, idx) => {
  const b = sample.book;
  const bookId = uid("bk");
  insertBook.run(
    bookId,
    b.googleId,
    b.title,
    b.authors,
    b.translator,
    b.publisher,
    b.publishedAt,
    b.isbn,
    b.pageCount,
    b.thumbnail,
    b.infoLink,
    b.description,
    b.isFavorite ? 1 : 0,
    now,
    now
  );

  if (idx === 0) insertBF.run(bookId, folderIds[0].id);
  if (idx === 1) insertBF.run(bookId, folderIds[1].id);
  if (idx === 2) insertBF.run(bookId, folderIds[1].id);

  for (const n of sample.notes) {
    const noteId = uid("nt");
    insertNote.run(
      noteId,
      bookId,
      n.title,
      n.content,
      n.rating,
      n.isPublic ? 1 : 0,
      n.bgColor,
      n.bgDark,
      n.readDate,
      now,
      now
    );
    for (const c of n.clips) {
      insertClip.run(uid("cl"), noteId, c.quote, c.page ?? null, c.memo ?? null, now);
    }
    for (const l of n.links) {
      insertLink.run(uid("lk"), noteId, l.label, l.url, null, null, null, now);
    }
  }
});

console.log("시드 데이터 3권이 추가되었어요.");
