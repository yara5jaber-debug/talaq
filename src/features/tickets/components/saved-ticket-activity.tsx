"use client";

import { useEffect, useState } from "react";
import {
  getTicketActivity,
  type SavedTicketActivity,
} from "@/features/tickets/actions/ticket-activity";

interface SavedTicketActivityProps {
  ticketId: string;
}

const fieldLabels: Record<SavedTicketActivity["field"], string> = {
  status: "الحالة",
  priority: "الأولوية",
  assignee_id: "المسؤول",
};

const statusLabels: Record<string, string> = {
  open: "جديد",
  in_progress: "قيد المعالجة",
  waiting_customer: "بانتظار العميل",
  resolved: "تم الحل",
};

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  normal: "عادية",
  high: "عالية",
  urgent: "عاجلة",
};

const dateFormatter = new Intl.DateTimeFormat("ar", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Hebron",
});

function formatValue(
  field: SavedTicketActivity["field"],
  value: string | null,
) {
  if (value === null) {
    return field === "assignee_id" ? "غير معيّن" : "غير محدد";
  }

  if (field === "status") {
    return statusLabels[value] ?? value;
  }

  if (field === "priority") {
    return priorityLabels[value] ?? value;
  }

  return value;
}

export function SavedTicketActivity({
  ticketId,
}: SavedTicketActivityProps) {
  const [activities, setActivities] = useState<SavedTicketActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getTicketActivity(ticketId);

        if (cancelled) return;

        if (!result.success) {
          setActivities([]);
          setError(result.error);
          return;
        }

        setActivities(result.activities);
      } catch {
        if (!cancelled) {
          setActivities([]);
          setError("تعذّر الاتصال. جرّبي تحديث سجل النشاط.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [ticketId, reloadKey]);

  function refreshActivity() {
    setIsLoading(true);
    setReloadKey((current) => current + 1);
  }

  return (
    <section
      aria-label="سجل نشاط الطلب"
      aria-busy={isLoading}
      className="mt-8 border-t border-line pt-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">سجل النشاط</h3>

        <button
          type="button"
          onClick={refreshActivity}
          disabled={isLoading}
          className="min-h-11 text-xs font-medium text-brand disabled:opacity-50"
        >
          {isLoading ? "جارٍ التحميل..." : "تحديث السجل"}
        </button>
      </div>

      <p className="mt-1 text-xs leading-6 text-muted">
        تغييرات معلومات الطلب، الأحدث أولًا.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm leading-7 text-brand">
          {error}
        </p>
      )}

      {!isLoading && !error && activities.length === 0 && (
        <p className="mt-5 text-xs leading-7 text-muted">
          لا توجد تغييرات مسجلة بعد. ستظهر هنا التغييرات الجديدة بعد حفظها.
        </p>
      )}

      {!isLoading && !error && activities.length > 0 && (
        <>
          <ol className="mt-5 space-y-5">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="border-s-2 border-line ps-3"
              >
                <p className="break-words text-xs leading-7">
                  <span className="font-semibold">
                    {activity.actorName}
                  </span>
                  {" غيّر "}
                  {fieldLabels[activity.field]}
                </p>

                <p className="mt-1 break-words text-xs leading-7 text-muted">
                  من{" "}
                  <bdi className="text-ink">
                    {formatValue(activity.field, activity.oldValue)}
                  </bdi>
                  {" إلى "}
                  <bdi className="text-ink">
                    {formatValue(activity.field, activity.newValue)}
                  </bdi>
                </p>

                <time
                  dateTime={activity.createdAt}
                  className="mt-2 block text-xs leading-6 text-muted"
                >
                  {dateFormatter.format(new Date(activity.createdAt))}
                </time>
              </li>
            ))}
          </ol>

          {activities.length === 100 && (
            <p className="mt-5 text-xs leading-6 text-muted">
              يتم عرض آخر 100 تغيير.
            </p>
          )}
        </>
      )}
    </section>
  );
}