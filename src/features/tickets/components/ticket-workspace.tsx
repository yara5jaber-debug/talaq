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

export function TicketWorkspace({
  tickets,
  isAdmin,
  agents,
  agentsError,
}: TicketWorkspaceProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
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
    if (id === null) return "بانتظار التعيين";

    return (
      agents.find((agent) => agent.id === id)?.fullName ??
      "تم تعيين موظف"
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[160px_minmax(0,1fr)]">
      <aside className="border-b border-line bg-canvas p-5 lg:border-b-0 lg:border-e">
        <p
          dir="ltr"
          className="text-start text-xl font-bold tracking-widest text-brand"
        >
          TALAQ
        </p>

        <p className="mt-2 text-xs text-muted">
          {isAdmin ? "مساحة المدير" : "مساحة الموظف"}
        </p>

        <nav aria-label="التنقل الرئيسي" className="mt-6 space-y-2">
          <Link
            href="/"
            aria-current="page"
            className="block border-s-2 border-brand bg-brand-soft px-3 py-3 text-sm font-medium text-brand"
          >
            الطلبات
          </Link>

          <Link
            href="/account"
            className="block px-3 py-3 text-sm text-muted hover:text-brand"
          >
            حسابي
          </Link>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <div role="status" aria-live="polite">
          {feedback && (
            <p className="border-b border-line bg-success-soft px-5 py-3 text-sm text-success">
              {feedback}
            </p>
          )}
        </div>

        <main aria-label="إدارة طلبات الدعم" className="min-w-0 flex-1 lg:flex">
          <section
            aria-labelledby="inbox-heading"
            className={`min-w-0 border-line lg:w-80 lg:shrink-0 lg:border-e ${
              selectedTicket ? "hidden lg:block" : "block"
            }`}
          >
            <header className="border-b border-line px-5 py-6">
              <div className="flex items-center justify-between gap-3">
                <h1 id="inbox-heading" className="text-xl font-semibold">
                  صندوق الطلبات
                </h1>
                <span aria-live="polite" className="text-xs text-muted">
                  {filteredTickets.length} من {tickets.length}
                </span>
              </div>

              <p className="mt-2 text-sm leading-7 text-muted">
                {isAdmin
                  ? "طلبات العملاء، الأحدث أولًا."
                  : "الطلبات المسندة إليك، الأحدث أولًا."}
              </p>

              <button
                type="button"
                onClick={refreshTickets}
                disabled={isRefreshing}
                className="mt-3 min-h-11 text-sm font-medium text-brand disabled:opacity-50"
              >
                {isRefreshing ? "جارٍ التحديث..." : "تحديث الطلبات"}
              </button>

              <div className="mt-4">
                <TicketFilters
                  query={query}
                  status={statusFilter}
                  onQueryChange={setQuery}
                  onStatusChange={setStatusFilter}
                  onReset={resetFilters}
                />
              </div>
            </header>

            {filteredTickets.length === 0 ? (
              <p className="px-5 py-8 text-sm leading-7 text-muted">
                {tickets.length === 0
                  ? isAdmin
                    ? "لا توجد طلبات حاليًا."
                    : "لا توجد طلبات مسندة إليك حاليًا."
                  : "لا توجد طلبات تطابق البحث أو الفلتر المختار."}
              </p>
            ) : (
              <ul aria-label="قائمة الطلبات">
                {filteredTickets.map((ticket) => {
                  const isSelected = ticket.id === selectedTicketId;

                  return (
                    <li key={ticket.id} className="border-b border-line">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedTicketId(ticket.id);
                          setFeedback("");
                        }}
                        className={`w-full border-s-2 px-5 py-5 text-start transition-colors ${
                          isSelected
                            ? "border-brand bg-brand-soft"
                            : "border-transparent hover:bg-surface"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span dir="ltr" className="font-mono text-xs text-muted">
                            TLQ-{ticket.number}
                          </span>
                          <TicketStatusBadge status={ticket.status} />
                        </div>

                        <h2 className="mt-3 text-sm font-semibold leading-7">
                          {ticket.subject}
                        </h2>

                        <p className="mt-2 text-xs text-muted">
                          {getAssigneeName(ticket.assigneeId)}
                        </p>
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
              className="flex min-w-0 flex-1 flex-col bg-surface"
            >
              {selectedTicketIsFilteredOut && (
                <div className="border-b border-line bg-warning-soft px-5 py-3 text-sm leading-7 text-warning">
                  الطلب المفتوح لا يطابق الفلاتر الحالية.
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="ms-3 min-h-11 underline underline-offset-4"
                  >
                    إظهار كل الطلبات
                  </button>
                </div>
              )}

              <header className="border-b border-line px-5 py-6 sm:px-8">
                <button
                  type="button"
                  onClick={() => setSelectedTicketId(null)}
                  className="mb-5 min-h-11 text-sm font-medium text-brand lg:hidden"
                >
                  العودة إلى الطلبات
                </button>

                <div className="flex flex-wrap items-center gap-4">
                  <span dir="ltr" className="font-mono text-sm text-muted">
                    TLQ-{selectedTicket.number}
                  </span>
                  <TicketStatusBadge status={selectedTicket.status} />
                </div>

                <h2
                  id="ticket-title"
                  className="mt-4 break-words text-xl font-semibold leading-9 sm:text-2xl"
                >
                  {selectedTicket.subject}
                </h2>
              </header>

              <div className="grid flex-1 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="min-w-0 px-5 py-8 sm:px-8">
                  <h3 className="text-sm font-semibold">وصف المشكلة</h3>
                  <p
                    dir="auto"
                    className="mt-6 whitespace-pre-wrap break-words text-sm leading-8"
                  >
                    {selectedTicket.description}
                  </p>
                  <TicketAiSummary
                    key={`summary:${selectedTicket.id}`}
                    ticketId={selectedTicket.id}
                  />
                  <SavedTicketConversation
                    key={selectedTicket.id}
                    ticketId={selectedTicket.id}
                  />
                </div>

                <aside
                  aria-label="معلومات الطلب"
                  className="border-t border-line bg-canvas px-5 py-8 xl:border-s xl:border-t-0"
                >
                  <h3 className="text-sm font-semibold">معلومات الطلب</h3>

                  <TicketPropertiesForm
                    key={[
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

                  <div className="mt-6 border-t border-line pt-5 text-sm">
                    <p className="text-muted">تاريخ الإنشاء</p>

                    <time
                      dateTime={selectedTicket.createdAt}
                      className="mt-1 block"
                    >
                      <bdi>{selectedTicket.createdAt.slice(0, 10)}</bdi>
                    </time>
                  </div>

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
              aria-label="تفاصيل الطلب"
              className="hidden min-w-0 flex-1 items-center justify-center bg-surface p-10 lg:flex"
            >
              <div className="max-w-sm">
                <p className="text-sm font-medium text-brand">مساحة المتابعة</p>
                <h2 className="mt-3 text-2xl font-semibold">
                  كل التفاصيل، في مكان واحد.
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted">
                  اختر طلبًا من القائمة لعرض حالته ووصف المشكلة.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}