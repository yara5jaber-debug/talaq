import Link from "next/link";
import { requireRole } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import {
  TicketWorkspace,
  type WorkspaceTicket,
} from "@/features/tickets/components/ticket-workspace";
import type { TicketAgent } from "@/features/tickets/components/ticket-properties-form";
import type { TicketPriority, TicketStatus } from "@/types/ticket";

export const dynamic = "force-dynamic";

function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    value === "open" ||
    value === "in_progress" ||
    value === "waiting_customer" ||
    value === "resolved"
  );
}

function isTicketPriority(value: unknown): value is TicketPriority {
  return (
    value === "low" ||
    value === "normal" ||
    value === "high" ||
    value === "urgent"
  );
}

export default async function Home() {
  const { user, profile } = await requireRole(["agent", "admin"]);
  const supabase = await createClient();
  const isAdmin = profile.role === "admin";

  let query = supabase
    .from("tickets")
    .select(
      "id, number, subject, description, status, priority, customer_id, assignee_id, created_at",
    )
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    query = query.eq("assignee_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Load workspace failed:", error.code, error.message);

    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="text-2xl font-semibold">تعذّر تحميل الطلبات</h1>
        <p role="alert" className="mt-4 text-sm leading-7 text-muted">
          حدّث الصفحة للمحاولة مجددًا. إذا استمرت المشكلة، راجع رسالة
          الخطأ في Terminal.
        </p>
        <Link href="/account" className="mt-6 inline-block text-brand">
          العودة إلى حسابي
        </Link>
      </main>
    );
  }

  const tickets: WorkspaceTicket[] = [];

  for (const row of data ?? []) {
    if (!isTicketStatus(row.status) || !isTicketPriority(row.priority)) {
      throw new Error("توجد حالة أو أولوية غير معروفة في بيانات الطلبات.");
    }

    tickets.push({
      id: row.id,
      number: row.number,
      subject: row.subject,
      description: row.description,
      status: row.status,
      priority: row.priority,
      customerId: row.customer_id,
      assigneeId: row.assignee_id,
      createdAt: row.created_at,
    });
  }

  const agents: TicketAgent[] = [];
  let agentsError: string | undefined;

  if (isAdmin) {
    const { data: agentsData, error: listError } =
      await supabase.rpc("list_ticket_agents");

    if (listError) {
      console.error("Load agents failed:", listError.code, listError.message);
      agentsError = "تعذّر تحميل الموظفين. اضغط تحديث الطلبات للمحاولة مجددًا.";
    } else {
      for (const agent of agentsData ?? []) {
        agents.push({
          id: agent.id,
          fullName: agent.full_name?.trim() || "موظف بدون اسم",
        });
      }
    }
  } else {
    agents.push({
      id: user.id,
      fullName: profile.fullName.trim() || "أنت",
    });
  }

  return (
    <TicketWorkspace
      tickets={tickets}
      isAdmin={isAdmin}
      agents={agents}
      agentsError={agentsError}
    />
  );
}