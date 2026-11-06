import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/ticket";

function isUserRole(value: unknown): value is UserRole {
  return (
    value === "customer" ||
    value === "agent" ||
    value === "admin"
  );
}

export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_demo")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("تعذّرت قراءة ملف المستخدم.");
  }

  if (!isUserRole(profile.role)) {
    throw new Error("دور المستخدم غير صالح.");
  }

  // عند تعذّر تحديد نوع الحساب، نتوقف بدل تجاوز قيود العرض.
  if (typeof profile.is_demo !== "boolean") {
    throw new Error("تعذّر التحقق من إعدادات حساب العرض.");
  }

  return {
    user,
    profile: {
      id: profile.id as string,
      fullName:
        typeof profile.full_name === "string"
          ? profile.full_name
          : "",
      role: profile.role,
      isDemo: profile.is_demo,
    },
  };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const currentUser = await requireUser();

  if (!allowedRoles.includes(currentUser.profile.role)) {
    redirect("/account");
  }

  return currentUser;
}