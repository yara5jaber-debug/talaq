interface ActivityBase {
  id: string;
  ticketId: string;
  actorName: string;
  createdAt: string;
}

export type TicketActivity = ActivityBase &
  (
    | {
        kind: "field_changed";
        fieldLabel: string;
        previousValue: string;
        nextValue: string;
      }
    | {
        kind: "reply_added" | "internal_note_added";
      }
  );

interface TicketActivityProps {
  activities: TicketActivity[];
}

const dateFormatter = new Intl.DateTimeFormat("ar", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Hebron",
});

export function TicketActivityLog({
  activities,
}: TicketActivityProps) {
  return (
    <section
      aria-labelledby="ticket-activity-heading"
      className="mt-8 border-t border-line pt-6"
    >
      <h3
        id="ticket-activity-heading"
        className="text-sm font-semibold"
      >
        سجل النشاط
      </h3>

      <p className="mt-2 text-xs leading-6 text-muted">
        تغييرات هذه الجلسة، الأحدث أولًا.
      </p>

      {activities.length === 0 ? (
        <p className="mt-4 text-xs leading-6 text-muted">
          لا يوجد نشاط مسجل بعد. سيظهر هنا عند تعديل الطلب أو إضافة رسالة.
        </p>
      ) : (
        <ol aria-label="أحداث الطلب" className="mt-5 space-y-5">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="border-s-2 border-line ps-3"
            >
              <p className="text-xs leading-6">
                <span className="font-semibold">
                  {activity.actorName}
                </span>{" "}
                {activity.kind === "field_changed"
                  ? `غيّرت ${activity.fieldLabel}`
                  : activity.kind === "reply_added"
                    ? "أضافت ردًا"
                    : "أضافت ملاحظة داخلية"}
              </p>

              {activity.kind === "field_changed" && (
                <p className="mt-1 text-xs leading-6 text-muted">
                  من{" "}
                  <span className="font-medium text-ink">
                    {activity.previousValue}
                  </span>{" "}
                  إلى{" "}
                  <span className="font-medium text-ink">
                    {activity.nextValue}
                  </span>
                </p>
              )}

              <time
                dateTime={activity.createdAt}
                className="mt-1 block text-xs leading-6 text-muted"
              >
                {dateFormatter.format(new Date(activity.createdAt))}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}