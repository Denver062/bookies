export type Book = {
  id: string;
  googleId: string | null;
  title: string;
  authors: string;
  translator: string | null;
  publisher: string | null;
  publishedAt: string | null;
  isbn: string | null;
  pageCount: number | null;
  thumbnail: string | null;
  infoLink: string | null;
  description: string | null;
  averageRating: number | null;
  ratingsCount: number | null;
  isFavorite: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  noteCount?: number;
  folderIds?: string[];
};

export type Clip = {
  id?: string;
  quote: string;
  page: string | null;
  memo: string | null;
  createdAt?: string;
};

export type LinkItem = {
  id?: string;
  label: string | null;
  url: string;
  fileData?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  isFile: boolean;
  createdAt?: string;
};

export type Note = {
  id: string;
  bookId: string;
  book?: Book;
  title: string;
  content: string;
  rating: number | null;
  isPublic: boolean;
  sharePassword: string | null;
  bgColor: string | null;
  bgDark: number;
  readDate: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  clips: Clip[];
  links: LinkItem[];
};

export type Folder = {
  id: string;
  name: string;
  color: string | null;
  userId: string | null;
  createdAt: string;
  bookCount?: number;
};

export type BookInfo = {
  googleId: string;
  title: string;
  authors: string[];
  translator?: string;
  publisher?: string;
  publishedAt?: string;
  isbn?: string;
  pageCount?: number;
  thumbnail?: string;
  infoLink?: string;
  description?: string;
  language?: string;
  averageRating?: number;
  ratingsCount?: number;
};

export type NoteInput = {
  bookId: string;
  title: string;
  content: string;
  rating: number | null;
  isPublic: boolean;
  sharePassword: string | null;
  bgColor: string | null;
  bgDark: number;
  readDate: string | null;
  clips: { quote: string; page: string | null; memo: string | null }[];
  links: LinkItem[];
};

export type Stats = {
  books: number;
  notes: number;
  clips: number;
  favorites: number;
  ratingAvg: number | null;
  totalPages: number;
};
