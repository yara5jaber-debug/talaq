"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { DemoLoginPanel } from "@/features/auth/demo-login-panel";
const features = [
  {
    number: "01",
    title: "طلبات مرتّبة",
    description: "المشكلة والردود والمرفقات في مكان واحد.",
  },
  {
    number: "02",
    title: "مسؤوليات واضحة",
    description: "توزيع الطلبات ومتابعة الحالة وحجم عمل الفريق.",
  },
  {
    number: "03",
    title: "متابعة أسرع",
    description: "ملخص بالذكاء الاصطناعي يساعد على فهم آخر التطورات.",
  },
];

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
          setErrorMessage("تعذّر تسجيل الدخول. حاول مرة أخرى.");
        }

        setIsSubmitting(false);
        return;
      }

      window.location.replace("/account");
    } catch {
      setErrorMessage(
        "تعذّر إكمال الاتصال. تحقق من الإنترنت وحاول مرة أخرى.",
      );
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "mt-2 min-h-12 w-full rounded-md border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 read-only:opacity-70";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-canvas text-ink"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4 border-b border-line py-6">
          <span
            dir="ltr"
            className="text-2xl font-bold tracking-[0.18em] text-brand"
          >
            TALAQ
          </span>

          <span className="text-xs text-muted sm:text-sm">
            مساحة عمل للدعم الفني
          </span>
        </header>

        <div className="grid flex-1 items-center gap-8 py-8 sm:py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <section aria-labelledby="intro-heading">
            <p className="text-xs font-semibold text-brand sm:text-sm">
              من أول رسالة، حتى الحلّ.
            </p>

            <h1
              id="intro-heading"
              className="mt-4 text-3xl font-semibold leading-[1.45] sm:text-4xl lg:text-5xl"
            >
              كل طلب واضح.
              <br />
              وكل متابعة بمكانها.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-8 text-muted sm:text-base">
              مساحة واحدة تجمع العميل وفريق الدعم، لتنظيم
              الطلبات ومتابعتها بخطوات واضحة.
            </p>

            <ol className="mt-10 hidden max-w-md border-t border-line lg:block">
              {features.map((feature) => (
                <li
                  key={feature.number}
                  className="flex gap-5 border-b border-line py-5"
                >
                  <span
                    aria-hidden="true"
                    className="pt-1 text-xs font-medium tabular-nums text-brand"
                  >
                    {feature.number}
                  </span>

                  <div>
                    <h2 className="text-sm font-semibold">
                      {feature.title}
                    </h2>

                    <p className="mt-1 text-sm leading-7 text-muted">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="login-heading"
            className="w-full rounded-lg border border-line bg-surface p-6 sm:p-8 lg:max-w-md lg:justify-self-end lg:p-10"
          >
            <div className="mb-7">
              <span
                aria-hidden="true"
                className="mb-6 block h-1 w-10 bg-brand"
              />

              <h2
                id="login-heading"
                className="text-2xl font-semibold"
              >
                أهلًا بعودتك.
              </h2>

              <p className="mt-3 text-sm leading-7 text-muted">
                سجّل دخولك للوصول إلى مساحة عملك.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
              className="space-y-5"
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
                  autoCapitalize="none"
                  spellCheck={false}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  readOnly={isSubmitting}
                  placeholder="you@example.com"
                  className={inputClassName}
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
                  className={inputClassName}
                />

                <label className="mt-2 flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) =>
                      setShowPassword(event.target.checked)
                    }
                    className="size-4 accent-brand"
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
                className="min-h-12 w-full rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting
                  ? "جارٍ تسجيل الدخول..."
                  : "تسجيل الدخول"}
              </button>
            </form>
            <DemoLoginPanel />
            
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-5 text-xs leading-6 text-muted">
          <p>TALAQ — إدارة الطلبات، بوضوح.</p>
          <p>تصميم وتطوير يارا جبر</p>
        </footer>
      </div>
    </main>
  );
}