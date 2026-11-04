"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.code === "email_not_confirmed") {
          setErrorMessage("يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول.");
        } else if (error.code === "invalid_credentials") {
          setErrorMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        } else {
          setErrorMessage("تعذّر تسجيل الدخول. حاولي مرة أخرى.");
        }

        setIsSubmitting(false);
        return;
      }

      // طلب صفحة جديدة حتى يقرأ الخادم جلسة تسجيل الدخول.
      window.location.replace("/account");
    } catch {
      setErrorMessage(
        "تعذّر إكمال الاتصال. تحققي من الإنترنت وإعدادات المشروع.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
      <section
        aria-labelledby="login-heading"
        className="w-full max-w-md"
      >
        <p
          dir="ltr"
          className="text-start text-2xl font-bold tracking-widest text-brand"
        >
          TALAQ
        </p>

        <div className="mt-8 border-t-2 border-brand pt-7">
          <h1 id="login-heading" className="text-3xl font-semibold">
            أهلًا بعودتك.
          </h1>

          <p className="mt-3 text-sm leading-7 text-muted">
            سجّل دخولك للوصول إلى حسابك.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
          className="mt-8 space-y-6"
        >
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium"
            >
              البريد الإلكتروني
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              readOnly={isSubmitting}
              placeholder="you@example.com"
              className="mt-2 min-h-12 w-full border border-line bg-surface px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium"
            >
              كلمة المرور
            </label>

            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              dir="ltr"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              readOnly={isSubmitting}
              className="mt-2 min-h-12 w-full border border-line bg-surface px-3 py-2 text-sm"
            />

            <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) =>
                  setShowPassword(event.target.checked)
                }
                className="accent-brand"
              />
              إظهار كلمة المرور
            </label>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="border-s-2 border-brand bg-brand-soft px-4 py-3 text-sm leading-7 text-brand"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-12 w-full bg-brand px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </section>
    </main>
  );
}