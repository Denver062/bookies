"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/actions/auth";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { Save } from "lucide-react";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {state.error}
        </div>
      ) : null}
      {state?.success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
          {state.success}
        </div>
      ) : null}

      <div>
        <Label>이름</Label>
        <Input name="name" defaultValue={name} required minLength={2} />
      </div>
      <div>
        <Label>이메일</Label>
        <Input name="email" type="email" defaultValue={email} required />
      </div>

      <div className="border-t border-line pt-3">
        <h3 className="mb-2 text-xs font-semibold text-ink-soft">비밀번호 변경 (선택)</h3>
        <div className="space-y-3">
          <div>
            <Label>현재 비밀번호</Label>
            <Input name="currentPassword" type="password" placeholder="변경 시 필수" />
          </div>
          <div>
            <Label>새 비밀번호</Label>
            <Input name="newPassword" type="password" placeholder="8자 이상" minLength={8} />
          </div>
        </div>
      </div>

      <Button type="submit" size="sm" disabled={pending} className="w-full">
        {pending ? <Spinner className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
        {pending ? "저장 중…" : "저장하기"}
      </Button>
    </form>
  );
}
