import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listFolders, listBooksByFolder } from "@/lib/folders";
import { getSession } from "@/lib/auth";
import { FoldersClient } from "@/components/folders-client";
import type { Book, Folder } from "@/lib/types";

export const metadata: Metadata = { title: "폴더" };

export const dynamic = "force-dynamic";

export default async function FoldersPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const folders = await listFolders(session.id);
  const entries: { folder: Folder; books: Book[] }[] = [];
  for (const folder of folders) {
    const books = await listBooksByFolder(folder.id);
    entries.push({ folder, books });
  }
  return <FoldersClient initial={entries} />;
}
