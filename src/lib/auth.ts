import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
};

async function getProfile(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("name, avatar_color")
    .eq("id", userId)
    .single();
  return data;
}

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfile(supabase, user.id);
  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.name ?? user.user_metadata?.name ?? "",
    avatarColor: profile?.avatar_color ?? "#b25a3a",
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("로그인이 필요합니다.");
  return session;
}

export async function registerUser(email: string, name: string, password: string): Promise<SessionUser> {
  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: { data: { name: name.trim() } },
  });

  if (error) {
    if (error.message.includes("already")) throw new Error("이미 사용 중인 이메일입니다.");
    throw new Error(error.message);
  }

  if (data.user) {
    // Update profile name if sign-up succeeded
    await supabase
      .from("profiles")
      .update({ name: name.trim() })
      .eq("id", data.user.id);

    return {
      id: data.user.id,
      email: normalizedEmail,
      name: name.trim(),
      avatarColor: "#b25a3a",
    };
  }

  throw new Error("회원가입에 실패했습니다.");
}

export async function loginUser(email: string, password: string): Promise<SessionUser> {
  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  const profile = await getProfile(supabase, data.user.id);
  return {
    id: data.user.id,
    email: normalizedEmail,
    name: profile?.name ?? data.user.user_metadata?.name ?? "",
    avatarColor: profile?.avatar_color ?? "#b25a3a",
  };
}

export async function destroySession(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function updateProfile(
  userId: string,
  data: { name?: string; email?: string; newPassword?: string }
): Promise<void> {
  const supabase = await createClient();

  if (data.name) {
    await supabase
      .from("profiles")
      .update({ name: data.name.trim(), updated_at: new Date().toISOString() })
      .eq("id", userId);
  }

  if (data.email) {
    const normalized = data.email.trim().toLowerCase();
    const { error } = await supabase.auth.updateUser({ email: normalized });
    if (error) throw new Error("이메일 변경에 실패했습니다.");
  }

  if (data.newPassword) {
    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    if (error) throw new Error("비밀번호 변경에 실패했습니다.");
  }
}

export async function getUserStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { books: 0, notes: 0, clips: 0, favorites: 0, totalPages: 0, ratingAvg: null };

  const [booksCount, notesCount, clipsCount, favsCount, pagesSum, avgResult] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.rpc("count_user_clips", { uid: user.id }).maybeSingle(),
    supabase.from("books").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_favorite", true),
    supabase.from("books").select("page_count").eq("user_id", user.id),
    supabase.from("notes").select("rating").eq("user_id", user.id).not("rating", "is", null),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const totalPages = (pagesSum.data ?? []).reduce((sum: number, b: any) => sum + (b.page_count ?? 0), 0);
  const ratings = (avgResult.data ?? []).map((n: any) => n.rating).filter(Boolean);
  const ratingAvg = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : null;

  return {
    books: booksCount.count ?? 0,
    notes: notesCount.count ?? 0,
    clips: clipsCount.data ?? 0,
    favorites: favsCount.count ?? 0,
    totalPages,
    ratingAvg,
  };
}
