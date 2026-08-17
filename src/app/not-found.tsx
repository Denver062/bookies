import Link from "next/link";
import { BookX } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
        <BookX className="h-10 w-10" />
      </div>
      <h1 className="font-serif text-3xl font-black text-ink">페이지를 찾지 못했어요</h1>
      <p className="mt-2 text-sm text-ink-soft">
        책이 삭제되었거나 잘못된 주소일 수 있어요.
      </p>
      <Link href="/" className="mt-6">
        <Button>홈으로</Button>
      </Link>
    </div>
  );
}
