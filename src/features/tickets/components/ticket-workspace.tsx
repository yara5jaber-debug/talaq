"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Ticket } from "@/types/ticket";
import { TicketStatusBadge } from "./ticket-status-badge";
import {
  TicketPropertiesForm,
  type TicketAgent,
} from "./ticket-properties-form";
import {
  TicketFilters,
  type TicketStatusFilter,
} from "./ticket-filters";
import { SavedTicketConversation } from "./saved-ticket-conversation";
import { SavedTicketActivity } from "./saved-ticket-activity";
import { TicketAiSummary } from "./ticket-ai-summary";

export type WorkspaceTicket = Ticket & {
  description: string;
};

interface TicketWorkspaceProps {
  tickets: WorkspaceTicket[];
  isAdmin: boolean;
  agents: TicketAgent[];
  agentsError?: string;
}

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  normal: "عادية",
  high: "عالية",
  urgent: "عاجلة",
};

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";

export function TicketWorkspace({
  tickets,
  isAdmin,
  agents,
  agentsError,
}: TicketWorkspaceProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<TicketStatusFilter>("all");
  const [feedback, setFeedback] = useState("");

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTickets = tickets.filter((ticket) => {
    const matchesQuery =
      ticket.subject.toLowerCase().includes(normalizedQuery) ||
      `TLQ-${ticket.number}`.toLowerCase().includes(normalizedQuery);

    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const selectedTicketIsFilteredOut =
    selectedTicket !== null &&
    !filteredTickets.some((ticket) => ticket.id === selectedTicket.id);

  const hasFilters = query.trim() !== "" || statusFilter !== "all";

  const activeCount = tickets.filter(
    (ticket) => ticket.status !== "resolved",
  ).length;

  const unassignedCount = tickets.filter(
    (ticket) =>
      ticket.status !== "resolved" && ticket.assigneeId === null,
  ).length;

  function resetFilters() {
    setQuery("");
    setStatusFilter("all");
  }

  function refreshTickets() {
    startTransition(() => {
      router.refresh();
    });
  }

  function handleSaved(ticketNumber: number) {
    setFeedback(`تم حفظ تغييرات الطلب TLQ-${ticketNumber}.`);
    refreshTickets();
  }

  function getAssigneeName(id: string | null) {
    if (id === null) return "بدون مسؤول";

    return (
      agents.find((agent) => agent.id === id)?.fullName ??
      "تم تعيين موظف"
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              aria-label="TALAQ — صندوق الطلبات"
              className={`text-2xl font-bold tracking-[0.18em] text-brand ${focusClass}`}
            >
              <span dir="ltr">TALAQ</span>
            </Link>

            <span className="hidden h-6 w-px bg-line sm:block" />

            <p className="hidden text-xs text-muted sm:block">
              {isAdmin ? "مساحة المدير" : "مساحة الموظف"}
            </p>
          </div>

          <nav
            aria-label="التنقل الرئيسي"
            className="flex flex-wrap items-center gap-1 text-sm"
          >
            <Link
              href="/"
              aria-current="page"
              className={`inline-flex min-h-11 items-center rounded-md bg-brand-soft px-4 font-semibold text-brand ${focusClass}`}
            >
              الطلبات
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`inline-flex min-h-11 items-center rounded-md px-4 text-muted transition hover:bg-canvas hover:text-ink ${focusClass}`}
              >
                لوحة المدير
              </Link>
            )}

            <Link
              href="/account"
              className={`inline-flex min-h-11 items-center rounded-md px-4 text-muted transition hover:bg-canvas hover:text-ink ${focusClass}`}
            >
              حسابي
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-medium text-brand">
              {isAdmin ? "متابعة فريق الدعم" : "مساحة المتابعة اليومية"}
            </p>

            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              صندوق الطلبات
            </h1>

            <p className="mt-2 text-sm leading-7 text-muted">
              {isAdmin
                ? "رتّب الأولويات، وزّع العمل، وتابع كل طلب حتى الحلّ."
                : "تابع طلباتك المسندة، واحتفظ بكل تفاصيل المتابعة في مكان واحد."}
            </p>
          </div>

          <button
            type="button"
            onClick={refreshTickets}
            disabled={isRefreshing}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-medium transition hover:border-brand hover:text-brand disabled:cursor-wait disabled:opacity-60 ${focusClass}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M20 7v5h-5" />
              <path d="M4 17v-5h5" />
              <path d="M6.1 7a7 7 0 0 1 11.6-1L20 9" />
              <path d="M17.9 17a7 7 0 0 1-11.6 1L4 15" />
            </svg>

            {isRefreshing ? "جارٍ التحديث..." : "تحديث الطلبات"}
          </button>
        </div>

        <dl className="mb-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <dt className="text-muted">الطلبات المعروضة</dt>
            <dd className="font-semibold tabular-nums">
              {tickets.length}
            </dd>
          </div>

          <div className="flex items-center gap-2">
            <dt className="text-muted">غير المحلولة</dt>
            <dd className="font-semibold tabular-nums">
              {activeCount}
            </dd>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <dt className="text-muted">بانتظار التعيين</dt>
              <dd className="font-semibold tabular-nums text-brand">
                {unassignedCount}
              </dd>
            </div>
          )}
        </dl>

        <div role="status" aria-live="polite" aria-atomic="true">
          {feedback && (
            <p className="mb-5 rounded-md border border-success/20 bg-success-soft px-4 py-3 text-sm leading-7 text-success">
              {feedback}
            </p>
          )}
        </div>

        <div className="grid min-w-0 items-start overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[310px_minmax(0,1fr)] 2xl:grid-cols-[350px_minmax(0,1fr)]">
          <section
            aria-labelledby="ticket-list-heading"
            className={`min-w-0 self-stretch bg-canvas lg:border-e lg:border-line ${
              selectedTicket ? "hidden lg:block" : "block"
            }`}
          >
            <div className="border-b border-line p-5">
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="ticket-list-heading"
                  className="text-sm font-semibold"
                >
                  {isAdmin ? "طلبات العملاء" : "الطلبات المسندة إليك"}
                </h2>

                <span
                  aria-live="polite"
                  className="rounded-md border border-line bg-surface px-2 py-1 text-xs tabular-nums text-muted"
                >
                  {filteredTickets.length} من {tickets.length}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted">
                مرتّبة من الأحدث إلى الأقدم
              </p>

              <div className="mt-5">
                <TicketFilters
                  query={query}
                  status={statusFilter}
                  onQueryChange={setQuery}
                  onStatusChange={setStatusFilter}
                  onReset={resetFilters}
                />
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="px-5 py-10">
                <h3 className="text-base font-semibold">
                  {tickets.length === 0
                    ? "لا توجد طلبات حاليًا"
                    : "لا توجد نتائج مطابقة"}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted">
                  {tickets.length === 0
                    ? isAdmin
                      ? "ستظهر طلبات العملاء هنا عند إنشائها."
                      : "ستظهر الطلبات هنا عندما يتم إسنادها إليك."
                    : "جرّب عنوانًا أو رقم طلب آخر، أو غيّر فلتر الحالة."}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={`mt-4 min-h-11 text-sm font-medium text-brand underline underline-offset-4 ${focusClass}`}
                  >
                    مسح البحث والفلاتر
                  </button>
                )}
              </div>
            ) : (
              <ul
                aria-label="قائمة الطلبات"
                className="divide-y divide-line lg:max-h-[76vh] lg:overflow-y-auto"
              >
                {filteredTickets.map((ticket) => {
                  const isSelected = ticket.id === selectedTicketId;
                  const isUrgent = ticket.priority === "urgent";
                  const isHigh = ticket.priority === "high";

                  return (
                    <li key={ticket.id}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedTicketId(ticket.id);
                          setFeedback("");
                        }}
                        className={`block w-full border-s-[3px] px-5 py-5 text-start transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${
                          isSelected
                            ? "border-brand bg-brand-soft"
                            : "border-transparent hover:bg-surface"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            dir="ltr"
                            className={`font-mono text-xs ${
                              isSelected ? "text-brand" : "text-muted"
                            }`}
                          >
                            TLQ-{ticket.number}
                          </span>

                          <TicketStatusBadge status={ticket.status} />
                        </div>

                        <h3 className="mt-3 break-words text-sm font-semibold leading-7">
                          {ticket.subject}
                        </h3>

                        <p
                          dir="auto"
                          className="mt-2 line-clamp-2 break-words text-xs leading-6 text-muted"
                        >
                          {ticket.description}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-muted">
                            {getAssigneeName(ticket.assigneeId)}
                          </span>

                          {(isUrgent || isHigh) && (
                            <span
                              className={
                                isUrgent
                                  ? "font-medium text-brand"
                                  : "font-medium text-warning"
                              }
                            >
                              {isUrgent ? "أولوية عاجلة" : "أولوية عالية"}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {selectedTicket ? (
            <section
              aria-labelledby="ticket-title"
              className="min-w-0"
            >
              {selectedTicketIsFilteredOut && (
                <div className="border-b border-line bg-warning-soft px-5 py-3 text-sm leading-7 text-warning">
                  الطلب المفتوح لا يطابق الفلاتر الحالية.
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={`ms-3 min-h-11 underline underline-offset-4 ${focusClass}`}
                  >
                    إظهار كل الطلبات
                  </button>
                </div>
              )}

              <header className="border-b border-line px-5 py-6 sm:px-7">
                <button
                  type="button"
                  onClick={() => setSelectedTicketId(null)}
                  className={`mb-5 flex min-h-11 items-center gap-2 text-sm font-medium text-brand lg:hidden ${focusClass}`}
                >
                  <span aria-hidden="true">→</span>
                  العودة إلى قائمة الطلبات
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    dir="ltr"
                    className="rounded-md border border-line bg-canvas px-2.5 py-1.5 font-mono text-xs text-muted"
                  >
                    TLQ-{selectedTicket.number}
                  </span>

                  <TicketStatusBadge status={selectedTicket.status} />

                  <span className="text-xs text-muted">
                    الأولوية:{" "}
                    <span
                      className={
                        selectedTicket.priority === "urgent"
                          ? "font-medium text-brand"
                          : "font-medium text-ink"
                      }
                    >
                      {priorityLabels[selectedTicket.priority] ??
                        selectedTicket.priority}
                    </span>
                  </span>
                </div>

                <h2
                  id="ticket-title"
                  dir="auto"
                  className="mt-5 break-words text-xl font-semibold leading-9 sm:text-2xl"
                >
                  {selectedTicket.subject}
                </h2>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-6 text-muted">
                  <p>
                    المسؤول: {getAssigneeName(selectedTicket.assigneeId)}
                  </p>

                  <p>
                    أُنشئ في{" "}
                    <time dateTime={selectedTicket.createdAt}>
                      <bdi>
                        {selectedTicket.createdAt.slice(0, 10)}
                      </bdi>
                    </time>
                  </p>
                </div>
              </header>

              <div className="grid min-w-0 items-start xl:grid-cols-[minmax(0,1fr)_250px] 2xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0 px-5 py-6 sm:px-7 sm:py-7">
                  <section aria-labelledby="description-heading">
                    <h3
                      id="description-heading"
                      className="text-sm font-semibold"
                    >
                      وصف المشكلة
                    </h3>

                    <div className="mt-4 rounded-md border border-line bg-canvas p-4 sm:p-5">
                      <p
                        dir="auto"
                        className="whitespace-pre-wrap break-words text-sm leading-8"
                      >
                        {selectedTicket.description}
                      </p>
                    </div>
                  </section>

                  <TicketAiSummary
                    key={`summary:${selectedTicket.id}`}
                    ticketId={selectedTicket.id}
                  />

                  <SavedTicketConversation
                    key={`conversation:${selectedTicket.id}`}
                    ticketId={selectedTicket.id}
                  />
                </div>

                <aside
                  aria-label="إدارة الطلب وسجل النشاط"
                  className="min-w-0 self-stretch border-t border-line bg-canvas px-5 py-6 xl:border-s xl:border-t-0"
                >
                  <h3 className="text-sm font-semibold">
                    إدارة الطلب
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-muted">
                    {isAdmin
                      ? "حدّد الحالة والأولوية والموظف المسؤول."
                      : "حدّث حالة الطلب وأولويته حسب آخر متابعة."}
                  </p>

                  <TicketPropertiesForm
                    key={[
                      "properties",
                      selectedTicket.id,
                      selectedTicket.status,
                      selectedTicket.priority,
                      selectedTicket.assigneeId ?? "",
                    ].join(":")}
                    ticket={selectedTicket}
                    isAdmin={isAdmin}
                    agents={agents}
                    agentsError={agentsError}
                    onSaved={handleSaved}
                  />

                  <SavedTicketActivity
                    key={[
                      "activity",
                      selectedTicket.id,
                      selectedTicket.status,
                      selectedTicket.priority,
                      selectedTicket.assigneeId ?? "",
                    ].join(":")}
                    ticketId={selectedTicket.id}
                  />
                </aside>
              </div>
            </section>
          ) : (
            <section
              aria-labelledby="empty-detail-heading"
              className="hidden min-h-[620px] min-w-0 items-center justify-center px-8 py-16 lg:flex"
            >
              <div className="w-full max-w-md text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-xl border border-line bg-canvas text-brand">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-8"
                  >
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <path d="M9 8h6M9 12h6M9 16h4" />
                  </svg>
                </div>

                <p className="mt-6 text-xs font-medium text-brand">
                  مساحة المتابعة
                </p>

                <h2
                  id="empty-detail-heading"
                  className="mt-3 text-2xl font-semibold leading-10"
                >
                  اختر طلبًا، وابدأ المتابعة.
                </h2>

                <p className="mt-4 text-sm leading-8 text-muted">
                  اختر طلبًا من القائمة لعرض المشكلة والمحادثة،
                  وتحديث حالته ومراجعة آخر الإجراءات.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-line pt-5 text-xs text-muted">
                  <span>تفاصيل الطلب</span>
                  <span>المحادثة والردود</span>
                  <span>سجل النشاط</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}