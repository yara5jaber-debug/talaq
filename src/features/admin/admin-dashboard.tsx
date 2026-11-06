"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Ticket } from "@/types/ticket";
import { ticketPriorityLabels } from "@/features/tickets/constants";
import { TicketStatusBadge } from "@/features/tickets/components/ticket-status-badge";

export interface AdminAgent {
  id: string;
  name: string;
}

interface AdminDashboardProps {
  tickets: Ticket[];
  agents: AdminAgent[];
  loadedAt: number;
}

type DashboardFilter = "all" | "active" | "overdue" | "unassigned";

const TARGET_MS = 24 * 60 * 60 * 1000;

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";

const dateFormatter = new Intl.DateTimeFormat("ar", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Hebron",
});

function getDeadline(ticket: Ticket) {
  return Date.parse(ticket.createdAt) + TARGET_MS;
}

function TicketDeadline({
  ticket,
  now,
}: {
  ticket: Ticket;
  now: number;
}) {
  if (ticket.status === "resolved") {
    return <span className="text-xs text-success">تم الحل</span>;
  }

  const deadline = getDeadline(ticket);
  const overdue = deadline <= now;

  return (
    <div>
      <time
        dateTime={new Date(deadline).toISOString()}
        className="block text-xs leading-6"
      >
        {dateFormatter.format(new Date(deadline))}
      </time>

      <span
        className={`mt-1 block text-xs ${
          overdue ? "font-semibold text-brand" : "text-muted"
        }`}
      >
        {overdue ? "متأخر عن المهلة" : "ضمن المهلة"}
      </span>
    </div>
  );
}

export function AdminDashboard({
  tickets,
  agents,
  loadedAt,
}: AdminDashboardProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [clock, setClock] = useState(loadedAt);
  const [filter, setFilter] = useState<DashboardFilter>("all");
  const [query, setQuery] = useState("");

  const now = Math.max(clock, loadedAt);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClock(Date.now());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  function refreshDashboard() {
    startTransition(() => {
      router.refresh();
    });
  }

  function isOverdue(ticket: Ticket) {
    return ticket.status !== "resolved" && getDeadline(ticket) <= now;
  }

  function getAssigneeName(assigneeId: string | null) {
    if (assigneeId === null) return "بدون مسؤول";

    return (
      agents.find((agent) => agent.id === assigneeId)?.name ??
      "مسؤول خارج قائمة الموظفين"
    );
  }

  function resetFilters() {
    setFilter("all");
    setQuery("");
  }

  const activeTickets = tickets.filter(
    (ticket) => ticket.status !== "resolved",
  );

  const unassignedTickets = activeTickets.filter(
    (ticket) => ticket.assigneeId === null,
  );

  const overdueTickets = tickets.filter(isOverdue);
  const normalizedQuery = query.trim().toLowerCase();

  const visibleTickets = tickets
    .filter((ticket) => {
      const matchesQuery =
        ticket.subject.toLowerCase().includes(normalizedQuery) ||
        `TLQ-${ticket.number}`.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && ticket.status !== "resolved") ||
        (filter === "overdue" && isOverdue(ticket)) ||
        (filter === "unassigned" &&
          ticket.status !== "resolved" &&
          ticket.assigneeId === null);

      return matchesQuery && matchesFilter;
    })
    .sort((first, second) => {
      const overdueDifference =
        Number(isOverdue(second)) - Number(isOverdue(first));

      return (
        overdueDifference ||
        Date.parse(first.createdAt) - Date.parse(second.createdAt) ||
        first.id.localeCompare(second.id)
      );
    });

  const workload = agents
    .map((agent) => ({
      ...agent,
      activeCount: activeTickets.filter(
        (ticket) => ticket.assigneeId === agent.id,
      ).length,
      overdueCount: overdueTickets.filter(
        (ticket) => ticket.assigneeId === agent.id,
      ).length,
    }))
    .sort(
      (first, second) =>
        second.activeCount - first.activeCount ||
        first.name.localeCompare(second.name, "ar"),
    );

  const maxWorkload = Math.max(
    1,
    ...workload.map((agent) => agent.activeCount),
  );

  const unknownAssigneeCount = activeTickets.filter(
    (ticket) =>
      ticket.assigneeId !== null &&
      !agents.some((agent) => agent.id === ticket.assigneeId),
  ).length;

  const statistics: {
    id: DashboardFilter;
    label: string;
    value: number;
    description: string;
  }[] = [
    {
      id: "all",
      label: "إجمالي الطلبات",
      value: tickets.length,
      description: "كل الطلبات المحمّلة في اللوحة",
    },
    {
      id: "active",
      label: "غير المحلولة",
      value: activeTickets.length,
      description: "تشمل الطلبات بانتظار العميل",
    },
    {
      id: "overdue",
      label: "طلبات متأخرة",
      value: overdueTickets.length,
      description: "تجاوزت 24 ساعة دون حلّ",
    },
    {
      id: "unassigned",
      label: "بانتظار التعيين",
      value: unassignedTickets.length,
      description: "طلبات غير محلولة بدون مسؤول",
    },
  ];

  const hasFilters = filter !== "all" || query !== "";

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
              مساحة المدير
            </p>
          </div>

          <nav
            aria-label="التنقل الرئيسي"
            className="flex flex-wrap items-center gap-1 text-sm"
          >
            <Link
              href="/"
              className={`inline-flex min-h-11 items-center rounded-md px-4 text-muted hover:bg-canvas hover:text-ink ${focusClass}`}
            >
              الطلبات
            </Link>

            <Link
              href="/admin"
              aria-current="page"
              className={`inline-flex min-h-11 items-center rounded-md bg-brand-soft px-4 font-semibold text-brand ${focusClass}`}
            >
              لوحة المدير
            </Link>

            <Link
              href="/account"
              className={`inline-flex min-h-11 items-center rounded-md px-4 text-muted hover:bg-canvas hover:text-ink ${focusClass}`}
            >
              حسابي
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-8">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-brand">
              نظرة على أداء المتابعة
            </p>

            <h1 className="mt-2 text-2xl font-semibold leading-relaxed sm:text-3xl">
              أين يحتاج الفريق تدخّلًا؟
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              تابع التأخير، وحدّد الطلبات التي تحتاج مسؤولًا،
              وراجع توزيع العمل بين الموظفين.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={refreshDashboard}
              disabled={isRefreshing}
              className={`inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-medium transition hover:border-brand hover:text-brand disabled:cursor-wait disabled:opacity-60 ${focusClass}`}
            >
              {isRefreshing ? "جارٍ التحديث..." : "تحديث اللوحة"}
            </button>

            <p role="status" className="text-xs leading-6 text-muted">
              آخر تحميل:{" "}
              <time dateTime={new Date(loadedAt).toISOString()}>
                {dateFormatter.format(new Date(loadedAt))}
              </time>
            </p>
          </div>
        </header>

        <section aria-label="ملخص الطلبات وفلاتر العرض" className="mt-7">
          <p className="mb-3 text-xs text-muted">
            اختر بطاقة لتصفية قائمة الطلبات أدناه.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((statistic) => {
              const selected = filter === statistic.id;
              const needsAttention =
                (statistic.id === "overdue" ||
                  statistic.id === "unassigned") &&
                statistic.value > 0;

              return (
                <button
                  key={statistic.id}
                  type="button"
                  aria-pressed={selected}
                  aria-controls="admin-ticket-results"
                  onClick={() => setFilter(statistic.id)}
                  className={`rounded-lg border p-5 text-start transition sm:p-6 ${focusClass} ${
                    selected
                      ? "border-brand bg-brand-soft"
                      : "border-line bg-surface hover:border-brand/50"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">
                      {statistic.label}
                    </span>
                    {selected && (
                      <span className="text-xs font-medium text-brand">
                        محدد
                      </span>
                    )}
                  </span>

                  <span
                    className={`mt-4 block text-4xl font-semibold tabular-nums ${
                      needsAttention ? "text-brand" : "text-ink"
                    }`}
                  >
                    {statistic.value}
                  </span>

                  <span className="mt-3 block text-xs leading-6 text-muted">
                    {statistic.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
          <section
            id="admin-ticket-results"
            aria-labelledby="admin-tickets-heading"
            className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface"
          >
            <div className="border-b border-line p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="admin-tickets-heading"
                  className="text-lg font-semibold"
                >
                  متابعة الطلبات
                </h2>

                <p
                  role="status"
                  className="rounded-md border border-line bg-canvas px-3 py-1 text-xs leading-6 tabular-nums text-muted"
                >
                  {visibleTickets.length} من {tickets.length}
                </p>
              </div>

              <p className="mt-2 text-xs leading-6 text-muted">
                المتأخرة أولًا، ثم الأقدم حسب تاريخ الإنشاء.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
                <div>
                  <label
                    htmlFor="dashboard-search"
                    className="block text-xs font-medium text-muted"
                  >
                    البحث عن طلب
                  </label>
                  <input
                    id="dashboard-search"
                    type="search"
                    dir="auto"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="عنوان الطلب أو TLQ-1042"
                    className="mt-2 min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dashboard-filter"
                    className="block text-xs font-medium text-muted"
                  >
                    عرض الطلبات
                  </label>
                  <select
                    id="dashboard-filter"
                    value={filter}
                    onChange={(event) =>
                      setFilter(event.target.value as DashboardFilter)
                    }
                    className="mt-2 min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="all">كل الطلبات</option>
                    <option value="active">غير المحلولة</option>
                    <option value="overdue">المتأخرة</option>
                    <option value="unassigned">بانتظار التعيين</option>
                  </select>
                </div>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`mt-3 min-h-11 text-xs font-medium text-brand underline underline-offset-4 ${focusClass}`}
                >
                  مسح البحث والفلاتر
                </button>
              )}
            </div>

            {visibleTickets.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <h3 className="text-lg font-semibold">
                  {tickets.length === 0
                    ? "لا توجد طلبات بعد"
                    : "لا توجد طلبات تطابق العرض"}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {tickets.length === 0
                    ? "ستظهر الطلبات وإحصائيات المتابعة عند إنشائها."
                    : "غيّر نوع العرض أو امسح البحث لرؤية بقية الطلبات."}
                </p>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-line md:hidden">
                  {visibleTickets.map((ticket) => (
                    <li key={ticket.id} className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span
                          dir="ltr"
                          className="font-mono text-xs text-muted"
                        >
                          TLQ-{ticket.number}
                        </span>
                        <TicketStatusBadge status={ticket.status} />
                      </div>

                      <h3
                        dir="auto"
                        className="mt-3 break-words text-sm font-semibold leading-7"
                      >
                        {ticket.subject}
                      </h3>

                      <p className="mt-2 text-xs text-muted">
                        الأولوية: {ticketPriorityLabels[ticket.priority]}
                      </p>

                      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4">
                        <div className="min-w-0">
                          <dt className="text-xs text-muted">المسؤول</dt>
                          <dd className="mt-2 break-words text-sm leading-6">
                            {getAssigneeName(ticket.assigneeId)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">
                            الموعد المستهدف
                          </dt>
                          <dd className="mt-2">
                            <TicketDeadline ticket={ticket} now={now} />
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>

                <div
                  role="region"
                  aria-label="جدول الطلبات، قابل للتمرير أفقيًا"
                  tabIndex={0}
                  className={`hidden overflow-x-auto md:block ${focusClass}`}
                >
                  <table className="w-full min-w-[680px] text-sm">
                    <caption className="sr-only">
                      الطلبات وحالاتها والمسؤولون عنها ومواعيد المتابعة
                    </caption>

                    <thead className="bg-canvas text-xs text-muted">
                      <tr>
                        {[
                          "الطلب",
                          "الحالة",
                          "المسؤول",
                          "الموعد المستهدف",
                        ].map((heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="px-5 py-4 text-start font-medium"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-line">
                      {visibleTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="align-top transition-colors hover:bg-canvas"
                        >
                          <th
                            scope="row"
                            className="w-[40%] px-5 py-5 text-start font-normal"
                          >
                            <span
                              dir="ltr"
                              className="inline-block font-mono text-xs text-muted"
                            >
                              TLQ-{ticket.number}
                            </span>
                            <p
                              dir="auto"
                              className="mt-2 break-words font-semibold leading-7"
                            >
                              {ticket.subject}
                            </p>
                            <p className="mt-2 text-xs text-muted">
                              الأولوية:{" "}
                              {ticketPriorityLabels[ticket.priority]}
                            </p>
                          </th>

                          <td className="px-5 py-5">
                            <TicketStatusBadge status={ticket.status} />
                          </td>

                          <td className="px-5 py-5 text-xs leading-7">
                            {getAssigneeName(ticket.assigneeId)}
                          </td>

                          <td className="px-5 py-5">
                            <TicketDeadline ticket={ticket} now={now} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas px-5 py-4">
              <p className="text-xs leading-6 text-muted">
                لتعديل طلب أو الرد عليه، افتحه من صندوق الطلبات.
              </p>
              <Link
                href="/"
                className={`inline-flex min-h-11 items-center text-sm font-semibold text-brand ${focusClass}`}
              >
                صندوق الطلبات
                <span aria-hidden="true" className="ms-2">←</span>
              </Link>
            </div>
          </section>

          <aside className="space-y-5">
            <section
              aria-labelledby="workload-heading"
              className="rounded-lg border border-line bg-surface p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="workload-heading" className="text-lg font-semibold">
                  توزيع العمل
                </h2>
                <span className="text-xs tabular-nums text-muted">
                  {agents.length} موظف
                </span>
              </div>

              <p className="mt-2 text-xs leading-6 text-muted">
                الطلبات غير المحلولة المسندة لكل موظف،
                مرتّبة حسب العدد.
              </p>

              {workload.length === 0 ? (
                <p className="mt-6 text-sm leading-7 text-muted">
                  لا توجد حسابات موظفين حاليًا.
                </p>
              ) : (
                <ul className="mt-6 space-y-6">
                  {workload.map((agent) => (
                    <li key={agent.id}>
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-canvas text-sm font-semibold text-brand"
                        >
                          {agent.name.trim().slice(0, 1) || "م"}
                        </span>

                        <h3 className="min-w-0 flex-1 break-words text-sm font-medium">
                          {agent.name || "موظف"}
                        </h3>

                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {agent.activeCount}
                          <span className="ms-1 text-xs font-normal text-muted">
                            طلب
                          </span>
                        </span>
                      </div>

                      <div
                        aria-hidden="true"
                        className="mt-3 h-2 overflow-hidden rounded-full bg-line"
                      >
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{
                            width: `${(agent.activeCount / maxWorkload) * 100}%`,
                          }}
                        />
                      </div>

                      <p
                        className={`mt-2 text-xs ${
                          agent.overdueCount > 0
                            ? "font-medium text-brand"
                            : "text-muted"
                        }`}
                      >
                        {agent.overdueCount > 0
                          ? `${agent.overdueCount} طلب متأخر`
                          : "لا توجد طلبات متأخرة"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-6 border-t border-line pt-4 text-xs leading-6 text-muted">
                طول الشريط للمقارنة بين أعداد الطلبات، وليس قياسًا
                لسعة الموظف أو أدائه.
              </p>
            </section>

            <section
              aria-labelledby="assignment-heading"
              className="rounded-lg border border-line bg-surface p-5 sm:p-6"
            >
              <p className="text-xs font-medium text-brand">
                الخطوة التالية
              </p>
              <h2
                id="assignment-heading"
                className="mt-2 text-base font-semibold"
              >
                {unassignedTickets.length > 0
                  ? "طلبات تحتاج مسؤولًا"
                  : "تعيين الطلبات مكتمل"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                {unassignedTickets.length > 0
                  ? `يوجد ${unassignedTickets.length} طلب غير محلول بدون مسؤول. راجع توزيع العمل قبل تعيينها.`
                  : "لا توجد طلبات غير محلولة بانتظار التعيين ضمن البيانات المعروضة."}
              </p>

              {unassignedTickets.length > 0 && (
                <button
                  type="button"
                  aria-controls="admin-ticket-results"
                  onClick={() => {
                    setFilter("unassigned");
                    setQuery("");
                    document
                      .getElementById("admin-ticket-results")
                      ?.scrollIntoView({ block: "start" });
                  }}
                  className={`mt-4 min-h-11 rounded-md border border-brand px-4 text-sm font-medium text-brand transition hover:bg-brand-soft ${focusClass}`}
                >
                  عرض الطلبات غير المعيّنة
                </button>
              )}

              {unknownAssigneeCount > 0 && (
                <p className="mt-4 border-s-2 border-warning bg-warning-soft p-3 text-xs leading-7 text-warning">
                  يوجد {unknownAssigneeCount} طلب غير محلول مسند إلى
                  حساب خارج قائمة الموظفين الحالية. راجع تعيينه
                  من صندوق الطلبات.
                </p>
              )}
            </section>
          </aside>
        </div>

        <footer className="mt-8 border-t border-line pt-5">
          <p className="text-xs leading-7 text-muted">
            قاعدة المتابعة: 24 ساعة متواصلة من إنشاء الطلب حتى حلّه،
            بما فيها وقت انتظار العميل. يُعاد حساب التأخير كل دقيقة
            للبيانات المعروضة؛ لجلب الطلبات والتعديلات الجديدة،
            اضغط «تحديث اللوحة».
          </p>
        </footer>
      </main>
    </div>
  );
}