"use client";

import { useRef, useState } from "react";
import { summarizeTicket } from "../actions/summarize-ticket";

interface TicketAiSummaryProps {
  ticketId: string;
}

export function TicketAiSummary({ ticketId }: TicketAiSummaryProps) {
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const requestLock = useRef(false);

  async function handleSummarize() {
    if (requestLock.current) return;

    requestLock.current = true;
    setIsLoading(true);
    setError("");
    setSummary("");

    try {
      const result = await summarizeTicket(ticketId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSummary(result.summary);
    } catch {
      setError("تعذّر التلخيص. حاولي مرة أخرى لاحقًا.");
    } finally {
      requestLock.current = false;
      setIsLoading(false);
    }
  }

  return (
    <section
      aria-label="ملخص الطلب بالذكاء الاصطناعي"
      className="mt-8 border-t border-line pt-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">ملخص يساعدك على المتابعة</h3>

        <button
          type="button"
          onClick={handleSummarize}
          disabled={isLoading}
          className="min-h-11 border border-brand px-4 py-2 text-sm font-medium text-brand disabled:cursor-wait disabled:opacity-50"
        >
          {isLoading
            ? "جارٍ التلخيص..."
            : summary
              ? "إعادة التلخيص"
              : "تلخيص الطلب"}
        </button>
      </div>

      <p className="mt-3 text-xs leading-6 text-muted">
        عند الضغط، يُرسل عنوان الطلب ووصفه وآخر 20 ردًا إلى Google Gemini.
        لا تُرسل الصور أو الملاحظات الداخلية. استخدمي بيانات تجريبية
        غير حساسة.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm leading-7 text-brand">
          {error}
        </p>
      )}

      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && (
          <p className="mt-4 text-sm text-muted">
            جارٍ قراءة الطلب وتجهيز الملخص...
          </p>
        )}

        {summary && (
          <div className="mt-5 border-s-2 border-brand bg-canvas p-5">
            <p
              dir="auto"
              className="whitespace-pre-wrap break-words text-sm leading-8"
            >
              {summary}
            </p>

            <p className="mt-4 border-t border-line pt-3 text-xs leading-6 text-muted">
              ملخص آلي قد يخطئ؛ راجعي المحادثة قبل اتخاذ إجراء.
              يعكس البيانات وقت إنشائه، ولا يتحدث تلقائيًا.
              لا يُحفظ ولا يُرسل للعميل.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}