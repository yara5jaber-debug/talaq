"use client";

import type { TicketStatus } from "@/types/ticket";
import { ticketStatusLabels } from "@/features/tickets/constants";

export type TicketStatusFilter = TicketStatus | "all";

interface TicketFiltersProps {
  query: string;
  status: TicketStatusFilter;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: TicketStatusFilter) => void;
  onReset: () => void;
}

const statusOptions: TicketStatusFilter[] = [
  "all",
  "open",
  "in_progress",
  "waiting_customer",
  "resolved",
];

export function TicketFilters({
  query,
  status,
  onQueryChange,
  onStatusChange,
  onReset,
}: TicketFiltersProps) {
  const hasFilters = query !== "" || status !== "all";

  return (
    <div className="mt-5 space-y-4">
      <div>
        <label
          htmlFor="ticket-search"
          className="mb-2 block text-xs font-medium text-muted"
        >
          البحث عن طلب
        </label>

        <input
          id="ticket-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="العنوان أو TLQ-1042"
          className="min-h-11 w-full min-w-0 rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted"
        />
      </div>

      <div>
        <label
          htmlFor="ticket-status"
          className="mb-2 block text-xs font-medium text-muted"
        >
          الحالة
        </label>

        <select
          id="ticket-status"
          value={status}
          onChange={(event) => {
            const value = event.target.value;

            const selectedStatus = statusOptions.find(
              (option) => option === value,
            );

            if (selectedStatus) {
              onStatusChange(selectedStatus);
            }
          }}
          className="min-h-11 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all"
                ? "كل الحالات"
                : ticketStatusLabels[option]}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 text-sm font-medium text-brand underline underline-offset-4"
        >
          مسح البحث والفلاتر
        </button>
      )}
    </div>
  );
}