import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked } from "lucide-react";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "회원가입" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-paper shadow-sm">
            <BookMarked className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-2xl font-black text-ink">회원가입</h1>
          <p className="mt-2 text-sm text-ink-soft">
            나만의 독서 기록을 시작해 보세요
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-ink-soft">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="font-medium text-accent-deep hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
