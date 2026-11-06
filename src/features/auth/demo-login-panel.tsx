"use client";

import { useRef, useState } from "react";
import { loginAsDemo } from "./demo-login";

export function DemoLoginPanel() {
  const [pendingRole, setPendingRole] = useState<
    "admin" | "customer" | null
  >(null);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);

  async function handleDemoLogin(role: "admin" | "customer") {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setPendingRole(role);
    setError("");

    try {
      const result = await loginAsDemo(role);
      setError(result.error);
    } catch {
      setError("تعذّر الدخول التجريبي. حاول مرة أخرى.");
    } finally {
      submittingRef.current = false;
      setPendingRole(null);
    }
  }

  const buttonClass =
    "min-h-12 w-full rounded-md border border-line px-4 py-3 text-sm font-medium transition-colors hover:border-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60";

  return (
    <section
      aria-labelledby="demo-heading"
      aria-busy={pendingRole !== null}
      className="mt-7 border-t border-line pt-6"
    >
      <h3 id="demo-heading" className="text-base font-semibold">
        أول زيارة؟ استكشف TALAQ.
      </h3>

      <p className="mt-2 text-xs leading-6 text-muted">
        ادخل مباشرة بحساب عرض، بدون كتابة بريد أو كلمة مرور.
      </p>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          disabled={pendingRole !== null}
          onClick={() => handleDemoLogin("admin")}
          className={`${buttonClass} text-brand`}
        >
          {pendingRole === "admin"
            ? "جارٍ فتح لوحة المدير..."
            : "استكشف لوحة المدير"}
        </button>

        <button
          type="button"
          disabled={pendingRole !== null}
          onClick={() => handleDemoLogin("customer")}
          className={`${buttonClass} text-ink`}
        >
          {pendingRole === "customer"
            ? "جارٍ فتح مساحة العميل..."
            : "استكشف مساحة العميل"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md bg-brand-soft px-3 py-2 text-xs leading-6 text-brand"
        >
          {error}
        </p>
      )}

      <p className="mt-3 text-xs leading-6 text-muted">
        بيانات وهمية للعرض فقط. الحفظ ورفع الملفات والتلخيص
        المباشر غير متاحة في هذه التجربة.
      </p>
    </section>
  );
}