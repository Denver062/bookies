"use server";

import { revalidatePath } from "next/cache";
import { registerUser, loginUser, destroySession, updateProfile, getSession } from "@/lib/auth";

export async function registerAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = String(formData.get("email") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!email || !email.includes("@")) return { error: "올바른 이메일을 입력해 주세요." };
  if (!name || name.length < 2) return { error: "이름은 2자 이상 입력해 주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
  if (password !== confirm) return { error: "비밀번호가 일치하지 않습니다." };

  try {
    await registerUser(email, name, password);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "회원가입에 실패했습니다." };
  }

  return { error: "" };
}

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) return { error: "이메일과 비밀번호를 입력해 주세요." };

  try {
    await loginUser(email, password);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "로그인에 실패했습니다." };
  }

  return { error: "" };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
}

export async function updateProfileAction(
  _prev: { error: string; success: string } | null,
  formData: FormData
): Promise<{ error: string; success: string }> {
  const session = await getSession();
  if (!session) return { error: "로그인이 필요합니다.", success: "" };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const newPassword = String(formData.get("newPassword") || "");
  const currentPassword = String(formData.get("currentPassword") || "");

  try {
    await updateProfile(session.id, {
      name: name || undefined,
      email: email || undefined,
      newPassword: newPassword || undefined,
      currentPassword: currentPassword || undefined,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "프로필 수정에 실패했습니다.", success: "" };
  }

  revalidatePath("/profile");
  revalidatePath("/");
  return { error: "", success: "프로필이 수정되었습니다." };
}
