"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type DemoRole = "admin" | "customer";
type DemoLoginResult = { success: false; error: string };

export async function loginAsDemo(
  role: DemoRole,
): Promise<DemoLoginResult> {
  // التحقق مطلوب حتى لو كان نوع TypeScript محددًا.
  if (role !== "admin" && role !== "customer") {
    return {
      success: false,
      error: "نوع حساب العرض غير صالح.",
    };
  }

  const account =
    role === "admin"
      ? {
          email: "demo.admin@talaq.example",
          password: process.env.DEMO_ADMIN_PASSWORD,
          id: "c27f0367-64c6-441a-8a3a-e78abdfab8c2",
          destination: "/admin",
        }
      : {
          email: "demo.customer@talaq.example",
          password: process.env.DEMO_CUSTOMER_PASSWORD,
          id: "f396e39a-0f00-4d48-8b61-52dcb2264e18",
          destination: "/support",
        };

  if (!account.password) {
    return {
      success: false,
      error: "الدخول التجريبي غير مهيّأ حاليًا.",
    };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: "تعذّر الدخول إلى حساب العرض. حاول لاحقًا.",
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, is_demo")
      .eq("id", data.user.id)
      .single();

    if (
      data.user.id !== account.id ||
      profileError ||
      !profile ||
      profile.role !== role ||
      profile.is_demo !== true
    ) {
      await supabase.auth.signOut();

      return {
        success: false,
        error: "إعدادات حساب العرض غير مكتملة.",
      };
    }
  } catch {
    return {
      success: false,
      error: "تعذّر الاتصال. حاول مجددًا.",
    };
  }

  // خارج try لأن redirect ينهي تنفيذ الدالة.
  redirect(account.destination);
}