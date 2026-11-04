"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TicketStatus } from "@/types/ticket";
import { createTicket } from "../actions/create-ticket";
import { CustomerRequestForm } from "./customer-request-form";
import { TicketStatusBadge } from "./ticket-status-badge";
import { SavedTicketConversation } from "./saved-ticket-conversation";


export interface CustomerSavedTicket {
  id: string;
  number: number;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
}

interface CustomerSupportProps {
  tickets: CustomerSavedTicket[];
  loadError?: string;
}

export function CustomerSupport({
  tickets,
  loadError,
}: CustomerSupportProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [saveError, setSaveError] = useState("");

  async function handleCreate(
    subject: string,
    description: string,
  ): Promise<boolean> {
    setFeedback("");
    setSaveError("");

    const result = await createTicket(subject, description);

    if (!result.success) {
      setSaveError(result.error);
      return false;
    }

    setFeedback(`تم حفظ طلبك TLQ-${result.number}.`);
    router.refresh();

    return true;
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <p
            dir="ltr"
            className="text-xl font-bold tracking-widest text-brand"
          >
            TALAQ
          </p>

          <Link href="/account" className="text-sm text-brand underline-offset-4 hover:underline">
            حسابي
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
          <section aria-labelledby="support-heading">
            <p className="text-sm font-medium text-brand">
              نبدأ من المشكلة، ونمشي معك للحل.
            </p>

            <h1
              id="support-heading"
              className="mt-4 max-w-md text-4xl font-semibold leading-normal sm:text-5xl"
            >
              كيف نقدر
              <br />
              نساعدك؟
            </h1>

            <p className="mt-5 max-w-md text-base leading-8 text-muted">
              احكِ لنا شو صار معك، وشو كنت تحاول تعمل. التفاصيل
              الواضحة بتساعد فريقنا يفهم المشكلة ويتابعها.
            </p>

            <div className="mt-8 max-w-md border-t border-line pt-5">
              <h2 className="text-sm font-semibold">شو أكتب في الطلب؟</h2>

              <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-7 text-muted">
                <li>الخطوة اللي ظهرت عندها المشكلة.</li>
                <li>نص رسالة الخطأ، إذا ظهرت.</li>
                <li>شو جرّبت تعمل لحلها.</li>
              </ul>

              <p className="mt-5 text-xs leading-6 text-muted">
                لا تكتب كلمة المرور أو معلومات الدفع داخل الطلب.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="request-form-heading"
            className="min-w-0 border-t-2 border-brand bg-surface px-5 py-7 sm:px-8"
          >
            <h2 id="request-form-heading" className="text-xl font-semibold">
              طلب دعم جديد
            </h2>

            <div role="status" aria-live="polite">
              {feedback && (
                <p className="mt-5 border-s-2 border-success bg-success-soft p-4 text-sm text-success">
                  {feedback}
                </p>
              )}
            </div>

            {saveError && (
              <p role="alert" className="mt-5 text-sm text-brand">
                {saveError}
              </p>
            )}

            <CustomerRequestForm onCreate={handleCreate} />
          </section>
        </div>

        <section aria-labelledby="my-tickets-heading" className="mt-16">
          <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
            <h2 id="my-tickets-heading" className="text-2xl font-semibold">
              طلباتي
            </h2>

            <button
              type="button"
              onClick={() => router.refresh()}
              className="min-h-11 px-3 text-sm font-medium text-brand"
            >
              تحديث القائمة
            </button>
          </div>

          {loadError ? (
            <p role="alert" className="py-6 text-sm text-brand">
              {loadError}
            </p>
          ) : tickets.length === 0 ? (
            <p className="py-8 text-sm text-muted">
              ما عندك طلبات بعد. اكتب مشكلتك في النموذج لإرسال أول طلب.
            </p>
          ) : (
            <ul>
              {tickets.map((ticket) => (
                <li key={ticket.id} className="border-b border-line">
                  <details className="py-5">
                    <summary className="cursor-pointer">
                      <span className="ms-2 font-semibold">
                        {ticket.subject}
                      </span>

                      <span
                        dir="ltr"
                        className="ms-3 inline-block font-mono text-xs text-muted"
                      >
                        TLQ-{ticket.number}
                      </span>
                    </summary>

                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      <TicketStatusBadge status={ticket.status} />

                      <time
                        dateTime={ticket.createdAt}
                        className="text-xs text-muted"
                      >
                        تاريخ الإنشاء:{" "}
                        <bdi>{ticket.createdAt.slice(0, 10)}</bdi>
                      </time>
                    </div>

                    <p
                      dir="auto"
                      className="mt-5 whitespace-pre-wrap break-words text-sm leading-8"
                    >
                      {ticket.description}
                    </p>

                    <SavedTicketConversation
                      key={ticket.id}
                      ticketId={ticket.id}
                    />
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-6 sm:px-8">
        <p className="border-t border-line pt-5 text-xs text-muted">
          TALAQ — مساحة واضحة لمتابعة مشكلتك.
        </p>
      </footer>
    </div>
  );
}