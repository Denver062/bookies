"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/actions/auth";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { UserPlus } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerAction, null);

  useEffect(() => {
    if (state && !state.error) {
      router.push("/");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      ) : null}
      <div>
        <Label>이름</Label>
        <Input name="name" placeholder="표시될 이름" required minLength={2} autoFocus />
      </div>
      <div>
        <Label>이메일</Label>
        <Input name="email" type="email" placeholder="you@example.com" required />
      </div>
      <div>
        <Label>비밀번호</Label>
        <Input name="password" type="password" placeholder="8자 이상" required minLength={8} />
      </div>
      <div>
        <Label>비밀번호 확인</Label>
        <Input name="confirm" type="password" placeholder="다시 한번 입력" required minLength={8} />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Spinner /> : <UserPlus className="h-4 w-4" />}
        {pending ? "가입 중…" : "회원가입"}
      </Button>
    </form>
  );
}
