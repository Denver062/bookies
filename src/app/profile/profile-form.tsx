"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/actions/auth";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { Save } from "lucide-react";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      ) : null}
      {state?.success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {state.success}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>이름</Label>
          <Input name="name" defaultValue={name} required minLength={2} />
        </div>
        <div>
          <Label>이메일</Label>
          <Input name="email" type="email" defaultValue={email} required />
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <h3 className="mb-3 text-sm font-semibold text-ink">비밀번호 변경 (선택)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner /> : <Save className="h-4 w-4" />}
          {pending ? "저장 중…" : "저장하기"}
        </Button>
      </div>
    </form>
  );
}
