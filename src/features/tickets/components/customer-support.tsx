
"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
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

type TicketFilter = "all" | "active" | "resolved";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";

const demoReadOnlyMessage =
  "أنت تستخدم حسابًا تجريبيًا مخصصًا لاستكشاف النظام. لإنشاء طلبات جديدة، يرجى استخدام حساب عادي.";

function CustomerTicketItem({
  ticket,
}: {
  ticket: CustomerSavedTicket;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <details
        className="group"
        onToggle={(event) => setIsOpen(event.currentTarget.open)}
      >
        <summary
          className={`cursor-pointer list-none px-5 py-5 transition-colors hover:bg-canvas sm:px-6 [&::-webkit-details-marker]:hidden ${focusClass}`}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              dir="ltr"
              className="font-mono text-xs text-muted"
            >
              TLQ-{ticket.number}
            </span>

            <TicketStatusBadge status={ticket.status} />

            <time
              dateTime={ticket.createdAt}
              className="ms-auto text-xs text-muted"
            >
              <bdi>{ticket.createdAt.slice(0, 10)}</bdi>
            </time>
          </div>

          <div className="mt-3 flex items-start justify-between gap-4">
            <h3 className="min-w-0 text-base font-semibold leading-7">
              <bdi className="break-words">{ticket.subject}</bdi>
            </h3>

            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mt-1 size-5 shrink-0 text-muted transition-transform group-open:rotate-180"
            >
              <path
                d="m6 9 6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="mt-2 text-xs leading-6 text-muted">
            {isOpen
              ? "إخفاء التفاصيل والمحادثة"
              : "عرض التفاصيل ومتابعة المحادثة"}
          </p>
        </summary>

        <div className="border-t border-line px-5 pb-6 pt-5 sm:px-6">
          <div className="rounded-md border border-line bg-canvas p-4 sm:p-5">
            <h4 className="text-xs font-semibold text-muted">
              وصف طلبك
            </h4>

            <p
              dir="auto"
              className="mt-3 whitespace-pre-wrap break-words text-sm leading-8"
            >
              {ticket.description}
            </p>
          </div>

          {isOpen && (
            <div className="mt-6 min-w-0">
              <SavedTicketConversation ticketId={ticket.id} />
            </div>
          )}
        </div>
      </details>
    </li>
  );
}

export function CustomerSupport({
  tickets,
  loadError,
}: CustomerSupportProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [saveError, setSaveError] = useState("");
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [isRefreshing, startTransition] = useTransition();

  const activeCount = tickets.filter(
    (ticket) => ticket.status !== "resolved",
  ).length;

  const resolvedCount = tickets.length - activeCount;

  const visibleTickets = tickets
    .filter((ticket) => {
      if (filter === "active") return ticket.status !== "resolved";
      if (filter === "resolved") return ticket.status === "resolved";
      return true;
    })
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) ||
        b.number - a.number,
    );

  const filters: {
    value: TicketFilter;
    label: string;
    count: number;
  }[] = [
    { value: "all", label: "الكل", count: tickets.length },
    { value: "active", label: "غير المحلولة", count: activeCount },
    { value: "resolved", label: "تم حلّها", count: resolvedCount },
  ];

  function refreshTickets() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleCreate(
    subject: string,
    description: string,
  ): Promise<boolean> {
    setFeedback("");
    setSaveError("");

    try {
      const result = await createTicket(subject, description);

      if (!result.success) {
        const errorMessage = result.error || "";

        const isDemoReadOnly = errorMessage
          .toLowerCase()
          .includes("demo accounts are read-only");

        setSaveError(
          isDemoReadOnly
            ? demoReadOnlyMessage
            : errorMessage || "تعذّر حفظ الطلب. حاولي مرة أخرى.",
        );

        return false;
      }

      setFeedback(
        `تم إرسال طلبك TLQ-${result.number}. يمكنك متابعة الردود من قائمة طلباتك.`,
      );

      setFilter("all");
      refreshTickets();

      return true;
    } catch {
      setSaveError(
        "تعذّر تأكيد إرسال الطلب. حدّث قائمة طلباتك قبل المحاولة مجددًا لتجنّب إرسال طلب مكرر.",
      );

      return false;
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/support"
              aria-label="TALAQ — صفحة الدعم"
              className={`text-2xl font-bold tracking-widest text-brand ${focusClass}`}
            >
              <span dir="ltr">TALAQ</span>
            </Link>

            <span className="hidden border-s border-line ps-4 text-xs text-muted sm:inline">
              مساحة العميل
            </span>
          </div>

          <nav aria-label="التنقل الرئيسي" className="flex gap-2">
            <Link
              href="/support"
              aria-current="page"
              className={`inline-flex min-h-11 items-center rounded-md bg-brand-soft px-4 text-sm font-medium text-brand ${focusClass}`}
            >
              طلباتي
            </Link>

            <Link
              href="/account"
              className={`inline-flex min-h-11 items-center rounded-md px-4 text-sm text-muted hover:bg-canvas hover:text-ink ${focusClass}`}
            >
              حسابي
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium text-brand">
              الدعم والمتابعة
            </p>

            <h1 className="mt-3 text-3xl font-semibold leading-normal">
              طلباتك، في مكان واحد.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
              تابع حالة طلبك، وراجع ردود الفريق، وأضف التفاصيل
              من نفس المحادثة.
            </p>
          </div>

          <a
            href="#new-request"
            className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-medium text-white hover:opacity-90 ${focusClass}`}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            طلب دعم جديد
          </a>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <section
            aria-labelledby="my-tickets-heading"
            className="min-w-0 rounded-lg border border-line bg-surface"
          >
            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="flex items-center justify-between gap-4">
                <h2
                  id="my-tickets-heading"
                  className="text-xl font-semibold"
                >
                  طلباتي
                </h2>

                <button
                  type="button"
                  onClick={refreshTickets}
                  disabled={isRefreshing}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-brand hover:bg-brand-soft disabled:cursor-wait disabled:opacity-60 ${focusClass}`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`size-4 ${isRefreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
                  >
                    <path
                      d="M20 7v5h-5M4 17v-5h5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 17.9 17"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isRefreshing ? "جارٍ التحديث..." : "تحديث"}
                </button>
              </div>

              <p className="mt-1 text-xs leading-6 text-muted">
                الأحدث أولًا. افتح الطلب لعرض تفاصيله والرد عليه.
              </p>

              {!loadError && (
                <div
                  role="group"
                  aria-label="تصفية الطلبات"
                  className="mt-5 flex flex-wrap gap-2 pb-5"
                >
                  {filters.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={filter === item.value}
                      aria-controls="customer-ticket-results"
                      onClick={() => setFilter(item.value)}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-xs transition-colors ${focusClass} ${
                        filter === item.value
                          ? "border-brand bg-brand-soft font-medium text-brand"
                          : "border-line text-muted hover:bg-canvas hover:text-ink"
                      }`}
                    >
                      {item.label}
                      <span className="tabular-nums">{item.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              id="customer-ticket-results"
              aria-busy={isRefreshing}
              className="border-t border-line"
            >
              {loadError ? (
                <div className="px-5 py-8 sm:px-6">
                  <p role="alert" className="text-sm leading-7 text-brand">
                    {loadError}
                  </p>

                  <p className="mt-2 text-xs leading-6 text-muted">
                    اضغط «تحديث» لإعادة تحميل طلباتك.
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="px-6 py-12 text-center sm:py-16">
                  <h3 className="text-lg font-semibold">
                    ما عندك طلبات بعد.
                  </h3>

                  <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-muted">
                    أرسل أول طلب، وستجد هنا حالته وكل الردود
                    المتعلقة به.
                  </p>

                  <a
                    href="#new-request"
                    className={`mt-5 inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm font-medium text-brand hover:bg-canvas ${focusClass}`}
                  >
                    كتابة أول طلب
                  </a>
                </div>
              ) : visibleTickets.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm leading-7 text-muted">
                    لا توجد طلبات ضمن هذا التصنيف.
                  </p>

                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`mt-3 min-h-11 rounded-md px-4 text-sm font-medium text-brand hover:bg-brand-soft ${focusClass}`}
                  >
                    عرض كل الطلبات
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {visibleTickets.map((ticket) => (
                    <CustomerTicketItem
                      key={ticket.id}
                      ticket={ticket}
                    />
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section
            id="new-request"
            aria-labelledby="request-form-heading"
            className="min-w-0 scroll-mt-6 rounded-lg border border-line bg-surface p-5 sm:p-6"
          >
            <div className="border-b border-line pb-5">
              <p className="text-xs font-medium text-brand">
                عندك مشكلة جديدة؟
              </p>

              <h2
                id="request-form-heading"
                className="mt-2 text-xl font-semibold"
              >
                أرسل طلب دعم
              </h2>

              <p className="mt-3 text-sm leading-7 text-muted">
                اكتب عنوانًا يصف المشكلة، ثم وضّح ما حدث وما
                كنت تتوقعه.
              </p>
            </div>

            <div role="status" aria-live="polite" aria-atomic="true">
              {feedback && (
                <p className="mt-5 rounded-md border border-success/25 bg-success-soft p-4 text-sm leading-7 text-success">
                  {feedback}
                </p>
              )}
            </div>

            {saveError && (
              <p
                role="alert"
                className="mt-5 rounded-md border border-brand/25 bg-brand-soft p-4 text-sm leading-7 text-brand"
              >
                {saveError}
              </p>
            )}

            <CustomerRequestForm onCreate={handleCreate} />

            <div className="mt-6 border-t border-line pt-5">
              <h3 className="text-xs font-semibold">
                تفاصيل تساعدنا على فهم المشكلة
              </h3>

              <ul className="mt-3 list-disc space-y-1 ps-4 text-xs leading-7 text-muted">
                <li>الخطوة التي ظهرت عندها المشكلة.</li>
                <li>نص رسالة الخطأ، إن ظهرت.</li>
                <li>الحلول التي جرّبتها بالفعل.</li>
              </ul>

              <p className="mt-4 text-xs leading-6 text-muted">
                حفاظًا على خصوصيتك، لا تُضمّن كلمات المرور أو
                بيانات الدفع.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
        <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-5 text-xs leading-6 text-muted">
          <p>TALAQ — مساحة واضحة للدعم والمتابعة.</p>
          <p>كل مشكلة ومتابعتها في طلب واحد.</p>
        </div>
      </footer>
    </div>
  );
}
