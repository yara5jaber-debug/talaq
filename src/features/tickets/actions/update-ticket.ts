"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

type UpdateTicketResult =
  | { success: true }
  | { success: false; error: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateTicket(
  ticketId: string,
  status: string,
  priority: string,
  assigneeId: string | null,
): Promise<UpdateTicketResult> {
  await requireRole(["admin", "agent"]);

  if (
    typeof ticketId !== "string" ||
    !uuidPattern.test(ticketId) ||
    typeof status !== "string" ||
    !["open", "in_progress", "waiting_customer", "resolved"].includes(status) ||
    typeof priority !== "string" ||
    !["low", "normal", "high", "urgent"].includes(priority) ||
    (assigneeId !== null &&
      (typeof assigneeId !== "string" || !uuidPattern.test(assigneeId)))
  ) {
    return { success: false, error: "بيانات التعديل غير صالحة." };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("update_ticket_details", {
    p_ticket_id: ticketId,
    p_status: status,
    p_priority: priority,
    p_assignee_id: assigneeId,
  });

  if (error) {
    console.error("Update ticket failed:", error.code, error.message);

    return {
      success: false,
      error:
        error.code === "42501"
          ? "لا تملك صلاحية تعديل هذا الطلب. حدّث الصفحة للتحقق من تعيينه."
          : "تعذّر حفظ التغييرات. تحقق من اختيار موظف صالح وحاول مجددًا.",
    };
  }

  revalidatePath("/");
  revalidatePath("/support");
  revalidatePath("/admin");

  return { success: true };
}