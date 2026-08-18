import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/nav";
import { getSession } from "@/lib/auth";
import "./globals.css";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "bookies — 나의 독서 기록",
    template: "%s · bookies",
  },
  description:
    "읽은 책을 기록하고, 중요한 내용을 클립하고, 내 프로필에 쌓아가는 독서 기록 서비스.",
  metadataBase: new URL("http://localhost:3000"),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="min-h-screen">
        <Nav user={session} />
        <div className="px-2 pb-24 pt-4 sm:px-4 lg:px-6">
          {children}
        </div>
        <footer className="border-t border-line px-4 py-6 text-center text-[11px] text-ink-faint">
          도서 DB 제공 : <a href="https://www.aladin.co.kr" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-soft">알라딘 인터넷서점(www.aladin.co.kr)</a>
        </footer>
      </body>
    </html>
  );
}
