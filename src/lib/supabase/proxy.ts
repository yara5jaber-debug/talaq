import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("إعدادات Supabase ناقصة في ملف .env.local");
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(cookiesToSet) {
        // تمرير الجلسة المحدّثة إلى مكوّنات الخادم.
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        // إرسال الجلسة المحدّثة إلى متصفح المستخدم.
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        // منع تخزين استجابة تحتوي على جلسة مستخدم في كاش مشترك.
        response.headers.set(
          "Cache-Control",
          "private, no-store, max-age=0",
        );
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
      },
    },
  });

  await supabase.auth.getClaims();

  return response;
}