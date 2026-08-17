-- Bookies Supabase Schema
-- Run this in Supabase SQL Editor

-- Users table (profiles - Supabase Auth handles auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT '#b25a3a',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    CASE (floor(random() * 8)::int)
      WHEN 0 THEN '#b25a3a'
      WHEN 1 THEN '#5f7f5a'
      WHEN 2 THEN '#3f5d7a'
      WHEN 3 THEN '#7a5b8f'
      WHEN 4 THEN '#b0853f'
      WHEN 5 THEN '#44605f'
      WHEN 6 THEN '#6b4f3c'
      ELSE '#555e66'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Books
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_id TEXT,
  title TEXT NOT NULL,
  authors TEXT NOT NULL DEFAULT '',
  translator TEXT,
  publisher TEXT,
  published_at TEXT,
  isbn TEXT,
  page_count INTEGER,
  thumbnail TEXT,
  info_link TEXT,
  description TEXT,
  average_rating REAL,
  ratings_count INTEGER,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_google_user ON books(google_id, user_id) WHERE google_id IS NOT NULL;

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  rating INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_password TEXT,
  bg_color TEXT,
  bg_dark REAL NOT NULL DEFAULT 1,
  read_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_book ON notes(book_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);

-- Clips
CREATE TABLE IF NOT EXISTS clips (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  quote TEXT NOT NULL,
  page TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clips_note ON clips(note_id);

-- Links
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  label TEXT,
  url TEXT NOT NULL,
  file_data TEXT,
  file_name TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_links_note ON links(note_id);

-- Folders
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_id);

-- Book-Folders junction
CREATE TABLE IF NOT EXISTS book_folders (
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, folder_id)
);

CREATE INDEX IF NOT EXISTS idx_book_folders_folder ON book_folders(folder_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_folders ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Books: users can CRUD their own
CREATE POLICY "Users can view own books" ON books
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own books" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own books" ON books
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own books" ON books
  FOR DELETE USING (auth.uid() = user_id);

-- Notes: users can CRUD their own, public notes readable by all
CREATE POLICY "Public notes readable" ON notes
  FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Clips: readable if parent note is accessible
CREATE POLICY "Clips readable via note" ON clips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = clips.note_id
      AND (notes.is_public = true OR notes.user_id = auth.uid())
    )
  );
CREATE POLICY "Users can manage clips via own notes" ON clips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = clips.note_id
      AND notes.user_id = auth.uid()
    )
  );

-- Links: readable if parent note is accessible
CREATE POLICY "Links readable via note" ON links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = links.note_id
      AND (notes.is_public = true OR notes.user_id = auth.uid())
    )
  );
CREATE POLICY "Users can manage links via own notes" ON links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = links.note_id
      AND notes.user_id = auth.uid()
    )
  );

-- Folders: users can CRUD their own
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE USING (auth.uid() = user_id);

-- Book-Folders: accessible via own books
CREATE POLICY "Users can manage own book_folders" ON book_folders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = book_folders.book_id
      AND books.user_id = auth.uid()
    )
  );
