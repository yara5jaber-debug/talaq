import Link from "next/link";
import { requireRole } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import {
  AdminDashboard,
  type AdminAgent,
} from "@/features/admin/admin-dashboard";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "@/types/ticket";

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

async function loadDashboardData() {
  const supabase = await createClient();
  const tickets: Ticket[] = [];

  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("tickets")
      .select(
        "id, number, subject, status, priority, customer_id, assignee_id, created_at",
      )
      .order("id", { ascending: true })
      .range(offset, offset + 499);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      if (
        !isTicketStatus(row.status) ||
        !isTicketPriority(row.priority) ||
        !Number.isFinite(Date.parse(row.created_at))
      ) {
        throw new Error("Invalid ticket data");
      }

      tickets.push({
        id: row.id,
        number: row.number,
        subject: row.subject,
        status: row.status,
        priority: row.priority,
        customerId: row.customer_id,
        assigneeId: row.assignee_id,
        createdAt: row.created_at,
      });
    }

    offset += data.length;
  }

  // الدالة الموجودة من الخطوة 03 تسمح للمدير بقراءة الموظفين.
  const agents: AdminAgent[] = [];
  offset = 0;

  while (true) {
    const { data, error } = await supabase
      .rpc("list_ticket_agents")
      .order("id", { ascending: true })
      .range(offset, offset + 499);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      agents.push({
        id: row.id,
        name: row.full_name?.trim() || "موظف بدون اسم",
      });
    }

    offset += data.length;
  }

  agents.sort((first, second) =>
    first.name.localeCompare(second.name, "ar"),
  );

  return {
  tickets,
  agents,
  loadedAt: Date.now(),
};
}

export default async function AdminPage() {
  await requireRole(["admin"]);

  let dashboardData: Awaited<ReturnType<typeof loadDashboardData>>;

  try {
    dashboardData = await loadDashboardData();
  } catch (error) {
    console.error("Failed to load admin dashboard:", error);

    return (
      <main className="min-h-screen bg-canvas px-5 py-16">
        <div className="mx-auto max-w-xl">
          <p className="text-xl font-bold tracking-widest text-brand">
            TALAQ
          </p>

          <h1 className="mt-8 text-2xl font-semibold">
            تعذّر تحميل لوحة المدير
          </h1>

          <p role="alert" className="mt-4 text-sm leading-8 text-muted">
            لم نتمكن من قراءة الطلبات أو الموظفين. جرّبي إعادة
            تحميل اللوحة.
          </p>

          <div className="mt-6 flex flex-wrap gap-5 text-sm text-brand">
            <a href="/admin" className="underline underline-offset-4">
              إعادة المحاولة
            </a>

            <Link href="/account" className="underline underline-offset-4">
              العودة إلى حسابي
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AdminDashboard
      tickets={dashboardData.tickets}
      agents={dashboardData.agents}
      loadedAt={dashboardData.loadedAt}
    />
  );
}