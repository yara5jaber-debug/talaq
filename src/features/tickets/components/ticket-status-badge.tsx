import type { TicketStatus } from "@/types/ticket";
import { ticketStatusLabels } from "@/features/tickets/constants";

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-brand-soft text-brand",
  in_progress: "bg-info-soft text-info",
  waiting_customer: "bg-warning-soft text-warning",
  resolved: "bg-success-soft text-success",
};

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export function TicketStatusBadge({
  status,
}: TicketStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-sm px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
      />

      {ticketStatusLabels[status]}
    </span>
  );
}