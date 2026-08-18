import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookMarked } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <div className="mx-auto mt-8 flex min-h-[75vh] max-w-4xl overflow-hidden rounded-2xl border border-line bg-cream shadow-book dark:bg-cream">
      <div className="hidden w-1/2 flex-col justify-center bg-ink px-10 py-12 text-paper md:flex">
        <BookMarked className="mb-6 h-10 w-10" />
        <h2 className="font-serif text-3xl font-black leading-snug">
          bookies에<br />오신 것을<br />환영합니다
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-paper/60">
          읽은 책을 기록하고,<br />독서 여정을 시작해 보세요.
        </p>
      </div>
      <div className="flex w-full flex-col justify-center px-8 py-10 sm:px-12 md:w-1/2">
        <div className="mb-6 text-center md:text-left">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-paper md:hidden">
            <BookMarked className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-black text-ink">로그인</h1>
          <p className="mt-1 text-sm text-ink-soft">
            계정에 로그인하세요
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-ink-soft md:text-left">
          아직 계정이 없으신가요?{" "}
          <Link href="/auth/register" className="font-medium text-accent-deep hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
