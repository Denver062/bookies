"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/actions/auth";
import { Button, Spinner } from "@/components/ui";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handle() {
    setPending(true);
    await logoutAction();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={handle} disabled={pending} className="w-full justify-center text-ink-faint hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
      {pending ? <Spinner className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
      로그아웃
    </Button>
  );
}
