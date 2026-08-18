"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const [state, formAction, pending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state && !state.error) {
      router.push(from);
      router.refresh();
    }
  }, [state, router, from]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="from" value={from} />
      {state?.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      ) : null}
      <div>
        <Label>이메일</Label>
        <Input name="email" type="email" placeholder="you@example.com" required autoFocus />
      </div>
      <div>
        <Label>비밀번호</Label>
        <Input name="password" type="password" placeholder="8자 이상" required minLength={8} />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Spinner /> : <LogIn className="h-4 w-4" />}
        {pending ? "로그인 중…" : "로그인"}
      </Button>
    </form>
  );
}
