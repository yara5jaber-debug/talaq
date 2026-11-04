import type {
  TicketMessage,
  UserRole,
} from "@/types/ticket";

interface TicketConversationProps {
  messages: TicketMessage[];
}

const roleLabels: Record<UserRole, string> = {
  customer: "العميل",
  agent: "فريق الدعم",
  admin: "المسؤول",
};

const timeFormatter = new Intl.DateTimeFormat("ar", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Hebron",
});

export function TicketConversation({
  messages,
}: TicketConversationProps) {
  if (messages.length === 0) {
    return (
      <p className="py-6 text-sm text-muted">
        لا توجد رسائل في هذا الطلب بعد.
      </p>
    );
  }

  return (
    <ol aria-label="رسائل المحادثة" className="mt-6 space-y-6">
      {messages.map((message) => {
        const isInternalNote = message.kind === "internal_note";

        return (
          <li key={message.id}>
            <article
              className={
                isInternalNote
                  ? "border-s-2 border-warning bg-warning-soft p-4"
                  : "border-b border-line pb-6"
              }
            >
              {isInternalNote && (
                <p className="mb-3 text-xs font-semibold text-warning">
                  ملاحظة داخلية · لفريق الدعم فقط
                </p>
              )}

              <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold">
                    {message.authorName}
                  </h4>

                  <span className="text-xs text-muted">
                    {roleLabels[message.authorRole]}
                  </span>
                </div>

                <time
                  dateTime={message.createdAt}
                  className="text-xs text-muted"
                >
                  {timeFormatter.format(new Date(message.createdAt))}
                </time>
              </header>

              <p
                dir="auto"
                className="mt-3 whitespace-pre-wrap break-words text-sm leading-8"
              >
                {message.body}
              </p>
            </article>
          </li>
        );
      })}
    </ol>
  );
}