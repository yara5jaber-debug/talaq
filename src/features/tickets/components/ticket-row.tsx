import type { Ticket } from "@/types/ticket";
import { ticketPriorityLabels } from "@/features/tickets/constants";
import { TicketStatusBadge } from "./ticket-status-badge";

interface TicketRowProps {
  ticket: Ticket;
}

export function TicketRow({ ticket }: TicketRowProps) {
  return (
    <li className="border-b border-line py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span dir="ltr" className="font-mono text-xs text-muted">
          TLQ-{ticket.number}
        </span>

        <TicketStatusBadge status={ticket.status} />
      </div>

      <h2 className="mt-3 text-lg font-semibold leading-8 text-ink">
        {ticket.subject}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
        <p>
          الأولوية:
          <span className="ms-1 font-medium text-ink">
            {ticketPriorityLabels[ticket.priority]}
          </span>
        </p>

        <p>
          {ticket.assigneeId === null
            ? "بانتظار تعيين موظف"
            : "تم تعيين موظف للمتابعة"}
        </p>
      </div>
    </li>
  );
}