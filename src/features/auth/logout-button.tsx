"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogout() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) {
        setErrorMessage("تعذّر تسجيل الخروج. حاولي مرة أخرى.");
        setIsSubmitting(false);
        return;
      }

      window.location.replace("/login");
    } catch {
      setErrorMessage("تعذّر إكمال العملية. تحققي من الاتصال.");
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
        className="min-h-11 border border-brand px-5 py-2 text-sm font-medium text-brand hover:bg-brand-soft disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
      </button>

      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-brand">
          {errorMessage}
        </p>
      )}
    </div>
  );
}