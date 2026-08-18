import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked } from "lucide-react";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "회원가입" };

export default function RegisterPage() {
  return (
    <div className="mx-auto mt-8 flex min-h-[75vh] max-w-4xl overflow-hidden rounded-2xl border border-line bg-cream shadow-book dark:bg-cream">
      <div className="hidden w-1/2 flex-col justify-center bg-ink px-10 py-12 text-paper md:flex">
        <BookMarked className="mb-6 h-10 w-10" />
        <h2 className="font-serif text-3xl font-black leading-snug">
          나만의<br />독서 기록을<br />시작해 보세요
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-paper/60">
          책을 검색하고, 기록하고,<br />서재를 만들어 보세요.
        </p>
      </div>
      <div className="flex w-full flex-col justify-center px-8 py-10 sm:px-12 md:w-1/2">
        <div className="mb-6 text-center md:text-left">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-paper md:hidden">
            <BookMarked className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-black text-ink">회원가입</h1>
          <p className="mt-1 text-sm text-ink-soft">
            새 계정을 만들세요
          </p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-ink-soft md:text-left">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="font-medium text-accent-deep hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
