"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Ticket } from "@/types/ticket";
import {
  ticketPriorityLabels,
  ticketStatusLabels,
} from "@/features/tickets/constants";
import { updateTicket } from "../actions/update-ticket";

export interface TicketAgent {
  id: string;
  fullName: string;
}

interface TicketPropertiesFormProps {
  ticket: Ticket;
  isAdmin: boolean;
  agents: TicketAgent[];
  agentsError?: string;
  onSaved: (ticketNumber: number) => void;
}

export function TicketPropertiesForm({
  ticket,
  isAdmin,
  agents,
  agentsError,
  onSaved,
}: TicketPropertiesFormProps) {
  const [status, setStatus] = useState<string>(ticket.status);
  const [priority, setPriority] = useState<string>(ticket.priority);
  const [assigneeId, setAssigneeId] = useState(ticket.assigneeId ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const savingRef = useRef(false);

  const hasChanges =
    status !== ticket.status ||
    priority !== ticket.priority ||
    (assigneeId || null) !== ticket.assigneeId;

  const assignmentUnavailable =
    assigneeId !== "" &&
    !agents.some((agent) => agent.id === assigneeId);

  const isBlocked = isAdmin && Boolean(agentsError);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (savingRef.current || !hasChanges || isBlocked) return;

    savingRef.current = true;
    setIsSaving(true);
    setError("");

    try {
      const result = await updateTicket(
        ticket.id,
        status,
        priority,
        assigneeId || null,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSaved(ticket.number);
    } catch {
      setError(
        "تعذّر تأكيد الحفظ. حدّث الصفحة للتحقق من القيم قبل المحاولة مجددًا.",
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  const selectClass =
    "mt-2 min-h-11 w-full border border-line bg-surface px-3 py-2 text-sm";

  return (
    <form onSubmit={handleSubmit} aria-busy={isSaving} className="mt-6">
      <fieldset disabled={isSaving || isBlocked} className="space-y-5">
        <legend className="sr-only">تعديل معلومات الطلب</legend>

        <div>
          <label htmlFor="ticket-status" className="text-sm text-muted">
            الحالة
          </label>
          <select
            id="ticket-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setError("");
            }}
            className={selectClass}
          >
            {Object.entries(ticketStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ticket-priority" className="text-sm text-muted">
            الأولوية
          </label>
          <select
            id="ticket-priority"
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value);
              setError("");
            }}
            className={selectClass}
          >
            {Object.entries(ticketPriorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {isAdmin ? (
          <div>
            <label htmlFor="ticket-assignee" className="text-sm text-muted">
              الموظف المسؤول
            </label>
            <select
              id="ticket-assignee"
              value={assigneeId}
              onChange={(event) => {
                setAssigneeId(event.target.value);
                setError("");
              }}
              className={selectClass}
            >
              <option value="">بدون تعيين</option>

              {assignmentUnavailable && (
                <option value={assigneeId} disabled>
                  المسؤول الحالي غير متاح
                </option>
              )}

              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.fullName}
                </option>
              ))}
            </select>

            {!agentsError && agents.length === 0 && (
              <p className="mt-2 text-xs leading-6 text-muted">
                لا توجد حسابات موظفين متاحة للتعيين.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm leading-7 text-muted">
            هذا الطلب مسند إليك. تغيير المسؤول متاح للمدير.
          </p>
        )}

        <button
          type="submit"
          disabled={!hasChanges || isSaving || isBlocked}
          className="min-h-11 w-full bg-brand px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
        </button>
      </fieldset>

      {agentsError && isAdmin && (
        <p role="alert" className="mt-4 text-sm leading-7 text-brand">
          {agentsError}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm leading-7 text-brand">
          {error}
        </p>
      )}
    </form>
  );
}