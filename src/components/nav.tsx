"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookMarked, Search, Library, NotebookPen, Heart, FolderOpen, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SessionUser } from "@/lib/auth";

const links = [
  { href: "/", label: "홈", icon: BookMarked },
  { href: "/search", label: "책 찾기", icon: Search },
  { href: "/books", label: "서재", icon: Library },
  { href: "/notes", label: "기록", icon: NotebookPen },
  { href: "/favorites", label: "즐겨찾기", icon: Heart, auth: true },
  { href: "/folders", label: "폴더", icon: FolderOpen, auth: true },
];

export function Nav({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-xl dark:bg-paper/90">
      <div className="flex h-14 items-center justify-between px-2 sm:px-4 lg:px-6">
        <Link href="/" className="font-serif text-lg font-bold tracking-tight text-ink">
          bookies
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            if (link.auth && !user) return null;
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors",
                  active
                    ? "text-accent-deep"
                    : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink"
                )}
              >
                <link.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{link.label}</span>
                {active ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-accent/12 ring-1 ring-accent/20"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <Link
              href="/profile"
              className={cn(
                "flex h-8 items-center gap-2 rounded-full px-3 text-[13px] font-medium transition-colors",
                pathname === "/profile"
                  ? "text-accent-deep bg-accent/10"
                  : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink"
              )}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: user.avatarColor }}
              >
                {user.name.slice(0, 1)}
              </span>
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-medium text-paper transition-colors hover:bg-ink/90"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">로그인</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
