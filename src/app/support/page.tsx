import { requireRole } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import {
  CustomerSupport,
  type CustomerSavedTicket,
} from "@/features/tickets/components/customer-support";
import type { TicketStatus } from "@/types/ticket";

export const dynamic = "force-dynamic";

function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    value === "open" ||
    value === "in_progress" ||
    value === "waiting_customer" ||
    value === "resolved"
  );
}

export default async function SupportPage() {
  const { user } = await requireRole(["customer"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tickets")
    .select("id, number, subject, description, status, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load tickets failed:", error.code, error.message);

    return (
      <CustomerSupport
        tickets={[]}
        loadError="تعذّر تحميل طلباتك. اضغط تحديث القائمة للمحاولة مجددًا."
      />
    );
  }

  const tickets: CustomerSavedTicket[] = [];

  for (const row of data ?? []) {
    if (!isTicketStatus(row.status)) {
      return (
        <CustomerSupport
          tickets={[]}
          loadError="تعذّر عرض الطلبات بسبب حالة طلب غير معروفة."
        />
      );
    }

    tickets.push({
      id: row.id,
      number: row.number,
      subject: row.subject,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
    });
  }

  return <CustomerSupport tickets={tickets} />;
}