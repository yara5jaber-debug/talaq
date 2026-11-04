import type {
  MessageKind,
  Ticket,
  TicketMessage,
} from "@/types/ticket";
import {
  ticketPriorityLabels,
  ticketStatusLabels,
} from "@/features/tickets/constants";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketConversation } from "./ticket-conversation";
import { TicketReplyForm } from "./ticket-reply-form";
import {
  TicketActivityLog,
  type TicketActivity,
} from "./ticket-activity";

export type TicketUpdates = Partial<
  Pick<Ticket, "status" | "priority" | "assigneeId">
>;

export const demoAgents = [
  { id: "demo-agent-1", name: "يارا" },
  { id: "demo-agent-2", name: "أحمد" },
];

interface TicketDetailsProps {
  ticket: Ticket;
  messages: TicketMessage[];
  activities: TicketActivity[];
  onBack: () => void;
  onSend: (body: string, kind: MessageKind) => void;
  onUpdate: (updates: TicketUpdates) => void;
}

const statusOptions: Ticket["status"][] = [
  "open",
  "in_progress",
  "waiting_customer",
  "resolved",
];

const priorityOptions: Ticket["priority"][] = [
  "low",
  "normal",
  "high",
  "urgent",
];

const selectClassName =
  "mt-2 min-h-11 w-full border border-line bg-surface px-3 py-2 text-sm";

export function TicketDetails({
  ticket,
  messages,
  activities,
  onBack,
  onSend,
  onUpdate,
}: TicketDetailsProps) {
  return (
    <section
      aria-labelledby="ticket-title"
      className="flex min-w-0 flex-1 flex-col bg-surface"
    >
      <header className="border-b border-line px-5 py-6 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 min-h-11 text-sm font-medium text-brand lg:hidden"
        >
          العودة إلى الطلبات
        </button>

        <div className="flex flex-wrap items-center gap-4">
          <span dir="ltr" className="font-mono text-sm text-muted">
            TLQ-{ticket.number}
          </span>

          <TicketStatusBadge status={ticket.status} />
        </div>

        <h2
          id="ticket-title"
          className="mt-4 text-xl font-semibold leading-9 sm:text-2xl"
        >
          {ticket.subject}
        </h2>
      </header>

      <div className="grid flex-1 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 px-5 py-8 sm:px-8">
          <h3 className="text-sm font-semibold">المحادثة</h3>

          <TicketConversation messages={messages} />

          <TicketReplyForm onSend={onSend} />
        </div>

        <aside
          aria-label="معلومات الطلب"
          className="border-t border-line bg-canvas px-5 py-8 xl:border-s xl:border-t-0"
        >
          <h3 className="text-sm font-semibold">معلومات الطلب</h3>

          <div className="mt-6 space-y-6">
            <div>
              <label
                htmlFor="ticket-detail-status"
                className="block text-sm text-muted"
              >
                الحالة
              </label>

              <select
                id="ticket-detail-status"
                value={ticket.status}
                onChange={(event) => {
                  const status = statusOptions.find(
                    (option) => option === event.target.value,
                  );

                  if (status) onUpdate({ status });
                }}
                className={selectClassName}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {ticketStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ticket-detail-priority"
                className="block text-sm text-muted"
              >
                الأولوية
              </label>

              <select
                id="ticket-detail-priority"
                value={ticket.priority}
                onChange={(event) => {
                  const priority = priorityOptions.find(
                    (option) => option === event.target.value,
                  );

                  if (priority) onUpdate({ priority });
                }}
                className={selectClassName}
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {ticketPriorityLabels[priority]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ticket-detail-assignee"
                className="block text-sm text-muted"
              >
                المسؤول
              </label>

              <select
                id="ticket-detail-assignee"
                value={ticket.assigneeId ?? ""}
                onChange={(event) => {
                  const value = event.target.value;

                  if (value === "") {
                    onUpdate({ assigneeId: null });
                    return;
                  }

                  const agent = demoAgents.find(
                    (item) => item.id === value,
                  );

                  if (agent) onUpdate({ assigneeId: agent.id });
                }}
                className={selectClassName}
              >
                <option value="">لم يُعيّن بعد</option>

                {demoAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <dl className="mt-6 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-muted">تاريخ الإنشاء</dt>
              <dd className="mt-1">
                <time dateTime={ticket.createdAt}>
                  <bdi>{ticket.createdAt.slice(0, 10)}</bdi>
                </time>
              </dd>
            </div>
          </dl>

          <TicketActivityLog activities={activities} />

          <p className="mt-6 text-xs leading-6 text-muted">
            بيانات تجريبية. تُمسح التغييرات والسجل عند تحديث الصفحة.
          </p>
        </aside>
      </div>
    </section>
  );
}