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

const TARGET_MS = 24 * 60 * 60 * 1000;

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

export function AdminDashboard({
  tickets,
  agents,
  loadedAt,
}: AdminDashboardProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [clock, setClock] = useState(loadedAt);
  const [overdueOnly, setOverdueOnly] = useState(false);

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
    return (
      ticket.status !== "resolved" &&
      getDeadline(ticket) <= now
    );
  }

  function getAssigneeName(assigneeId: string | null) {
    if (assigneeId === null) return "لم يُعيّن بعد";

    return (
      agents.find((agent) => agent.id === assigneeId)?.name ??
      "مسؤول خارج قائمة الموظفين"
    );
  }

  const activeTickets = tickets.filter(
    (ticket) => ticket.status !== "resolved",
  );

  const unassignedTickets = activeTickets.filter(
    (ticket) => ticket.assigneeId === null,
  );

  const overdueTickets = tickets.filter(isOverdue);

  const visibleTickets = (
    overdueOnly ? overdueTickets : tickets
  )
    .slice()
    .sort((first, second) => {
      const overdueDifference =
        Number(isOverdue(second)) - Number(isOverdue(first));

      return (
        overdueDifference ||
        Date.parse(first.createdAt) - Date.parse(second.createdAt) ||
        first.id.localeCompare(second.id)
      );
    });

  const workload = agents.map((agent) => ({
    ...agent,
    activeCount: activeTickets.filter(
      (ticket) => ticket.assigneeId === agent.id,
    ).length,
    overdueCount: overdueTickets.filter(
      (ticket) => ticket.assigneeId === agent.id,
    ).length,
  }));

  const maxWorkload = Math.max(
    1,
    ...workload.map((agent) => agent.activeCount),
  );

  const unknownAssigneeCount = activeTickets.filter(
    (ticket) =>
      ticket.assigneeId !== null &&
      !agents.some((agent) => agent.id === ticket.assigneeId),
  ).length;

  const statistics = [
    {
      label: "إجمالي الطلبات",
      value: tickets.length,
      description: "جميع الطلبات المسجلة",
    },
    {
      label: "طلبات مفتوحة",
      value: activeTickets.length,
      description: "كل الطلبات التي لم تُحل",
    },
    {
      label: "طلبات متأخرة",
      value: overdueTickets.length,
      description: "لم تُحل خلال 24 ساعة من الإنشاء",
    },
    {
      label: "بانتظار التعيين",
      value: unassignedTickets.length,
      description: "طلبات مفتوحة بدون مسؤول",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <p
            dir="ltr"
            className="text-xl font-bold tracking-widest text-brand"
          >
            TALAQ
          </p>

          <nav
            aria-label="روابط لوحة المدير"
            className="flex flex-wrap items-center gap-5 text-sm"
          >
            <Link href="/" className="text-brand hover:underline">
              صندوق الطلبات
            </Link>

            <Link href="/account" className="text-muted hover:text-brand">
              حسابي
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <header>
          <p className="text-sm font-medium text-brand">
            مساحة المدير
          </p>

          <h1 className="mt-3 text-3xl font-semibold leading-relaxed sm:text-4xl">
            أين يحتاج الفريق تدخّلًا؟
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-8 text-muted">
            تابع الطلبات المتأخرة، والطلبات التي تنتظر مسؤولًا،
            وتوزيع العمل بين الموظفين.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={refreshDashboard}
              disabled={isRefreshing}
              className="min-h-11 border border-brand px-4 py-2 text-sm font-medium text-brand disabled:opacity-50"
            >
              {isRefreshing ? "جارٍ التحديث..." : "تحديث اللوحة"}
            </button>

            <p role="status" className="text-xs leading-6 text-muted">
              آخر تحميل للبيانات:{" "}
              <time dateTime={new Date(loadedAt).toISOString()}>
                {dateFormatter.format(new Date(loadedAt))}
              </time>
            </p>
          </div>
        </header>

        <section
          aria-label="ملخص الطلبات"
          className="mt-9 grid border-y border-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {statistics.map((statistic) => (
            <div
              key={statistic.label}
              className="border-b border-line px-4 py-6 last:border-b-0 lg:border-b-0 lg:border-e lg:last:border-e-0"
            >
              <h2 className="text-sm text-muted">
                {statistic.label}
              </h2>

              <p className="mt-3 text-4xl font-semibold tabular-nums">
                {statistic.value}
              </p>

              <p className="mt-2 text-xs leading-6 text-muted">
                {statistic.description}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section
            aria-labelledby="admin-tickets-heading"
            className="min-w-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2
                id="admin-tickets-heading"
                className="text-xl font-semibold"
              >
                متابعة الطلبات
              </h2>

              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={overdueOnly}
                  onChange={(event) =>
                    setOverdueOnly(event.target.checked)
                  }
                  className="size-4 accent-brand"
                />
                المتأخرة فقط
              </label>
            </div>

            <p className="mt-2 text-xs leading-6 text-muted">
              المتأخرة أولًا، ثم الأقدم حسب تاريخ الإنشاء.
            </p>

            <p role="status" className="mt-3 text-xs text-muted">
              {visibleTickets.length} طلب في العرض الحالي
            </p>

            <div
              role="region"
              aria-label="جدول متابعة الطلبات، قابل للتمرير أفقيًا"
              tabIndex={0}
              className="mt-4 overflow-x-auto border-y border-line"
            >
              <table className="w-full min-w-[680px] text-start text-sm">
                <caption className="sr-only">
                  الطلبات وحالاتها والمسؤولون عنها ومواعيد المتابعة
                </caption>

                <thead className="bg-surface text-muted">
                  <tr>
                    {["الطلب", "الحالة", "المسؤول", "الموعد المستهدف"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="px-4 py-4 text-start font-medium"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {visibleTickets.map((ticket) => {
                    const overdue = isOverdue(ticket);
                    const deadline = getDeadline(ticket);

                    return (
                      <tr key={ticket.id} className="border-t border-line">
                        <th
                          scope="row"
                          className="max-w-xs px-4 py-5 text-start font-normal"
                        >
                          <span
                            dir="ltr"
                            className="inline-block font-mono text-xs text-muted"
                          >
                            TLQ-{ticket.number}
                          </span>

                          <p className="mt-2 break-words font-semibold leading-7">
                            {ticket.subject}
                          </p>

                          <p className="mt-2 text-xs text-muted">
                            الأولوية: {ticketPriorityLabels[ticket.priority]}
                          </p>
                        </th>

                        <td className="px-4 py-5">
                          <TicketStatusBadge status={ticket.status} />
                        </td>

                        <td className="px-4 py-5">
                          {getAssigneeName(ticket.assigneeId)}
                        </td>

                        <td className="px-4 py-5">
                          {ticket.status === "resolved" ? (
                            <span className="text-success">تم الحل</span>
                          ) : (
                            <>
                              <time
                                dateTime={new Date(deadline).toISOString()}
                                className="block text-xs leading-6"
                              >
                                {dateFormatter.format(new Date(deadline))}
                              </time>

                              <span
                                className={`mt-1 block text-xs ${
                                  overdue
                                    ? "font-medium text-brand"
                                    : "text-muted"
                                }`}
                              >
                                {overdue ? "متأخر" : "ضمن المهلة"}
                              </span>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {visibleTickets.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-muted"
                      >
                        {overdueOnly
                          ? "لا توجد طلبات متأخرة حاليًا."
                          : "لا توجد طلبات لعرضها."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside
            aria-labelledby="workload-heading"
            className="border-t border-line pt-6 xl:border-s xl:border-t-0 xl:ps-6 xl:pt-0"
          >
            <h2 id="workload-heading" className="text-lg font-semibold">
              حجم العمل
            </h2>

            <p className="mt-2 text-xs leading-6 text-muted">
              عدد الطلبات غير المحلولة المعيّنة لكل موظف.
            </p>

            {workload.length === 0 ? (
              <p className="mt-6 text-sm leading-7 text-muted">
                لا توجد حسابات موظفين حاليًا.
              </p>
            ) : (
              <ul className="mt-6 space-y-7">
                {workload.map((agent) => (
                  <li key={agent.id}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="break-words text-sm font-medium">
                        {agent.name}
                      </h3>

                      <span className="shrink-0 text-sm tabular-nums">
                        {agent.activeCount} طلب
                      </span>
                    </div>

                    <div
                      aria-hidden="true"
                      className="mt-3 h-1.5 bg-line"
                    >
                      <div
                        className="h-full bg-brand"
                        style={{
                          width: `${(agent.activeCount / maxWorkload) * 100}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-muted">
                      {agent.overdueCount} متأخر
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-7 border-t border-line pt-4 text-sm leading-7">
              <span className="font-semibold">
                {unassignedTickets.length}
              </span>{" "}
              طلب مفتوح لم يُعيّن لموظف بعد.
            </p>

            {unknownAssigneeCount > 0 && (
              <p className="mt-4 text-xs leading-7 text-warning">
                يوجد {unknownAssigneeCount} طلب مفتوح مسند إلى حساب
                خارج قائمة الموظفين الحالية. راجعي تعيين هذه الطلبات.
              </p>
            )}

            <Link
              href="/"
              className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-brand hover:underline"
            >
              الانتقال إلى صندوق الطلبات
            </Link>
          </aside>
        </div>

        <p className="mt-10 border-t border-line pt-5 text-xs leading-7 text-muted">
          قاعدة المتابعة: مهلة 24 ساعة متواصلة من إنشاء الطلب حتى
          حله، بما فيها وقت انتظار العميل. يُعاد حساب التأخير كل
          دقيقة للبيانات المعروضة. لجلب طلبات أو تعديلات جديدة،
          اضغطي «تحديث اللوحة».
        </p>
      </main>
    </div>
  );
}