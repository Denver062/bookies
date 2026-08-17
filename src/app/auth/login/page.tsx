import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookMarked } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-paper shadow-sm">
            <BookMarked className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-2xl font-black text-ink">로그인</h1>
          <p className="mt-2 text-sm text-ink-soft">
            bookies에 오신 것을 환영합니다
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-ink-soft">
          아직 계정이 없으신가요?{" "}
          <Link href="/auth/register" className="font-medium text-accent-deep hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
