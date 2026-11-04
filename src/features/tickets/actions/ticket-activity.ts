"use server";

import { requireRole } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export interface SavedTicketActivity {
  id: string;
  actorName: string;
  field: "status" | "priority" | "assignee_id";
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

type ActivityResult =
  | {
      success: true;
      activities: SavedTicketActivity[];
    }
  | {
      success: false;
      error: string;
    };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getTicketActivity(
  ticketId: string,
): Promise<ActivityResult> {
  await requireRole(["admin", "agent"]);

  if (typeof ticketId !== "string" || !uuidPattern.test(ticketId)) {
    return {
      success: false,
      error: "معرّف الطلب غير صحيح.",
    };
  }

  const supabase = await createClient();

  // التحقق من إمكانية الوصول إلى الطلب تحت صلاحيات المستخدم.
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    return {
      success: false,
      error: "الطلب غير متاح، أو لم يعد مسندًا إليك.",
    };
  }

  const { data, error } = await supabase
    .from("ticket_activity")
    .select(
      "id, actor_name, field, old_value, new_value, created_at",
    )
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to load ticket activity:", error);

    return {
      success: false,
      error: "تعذّر تحميل سجل النشاط. جرّبي تحديث السجل.",
    };
  }

  const activities: SavedTicketActivity[] = [];

  for (const row of data ?? []) {
    if (
      row.field !== "status" &&
      row.field !== "priority" &&
      row.field !== "assignee_id"
    ) {
      continue;
    }

    activities.push({
      id: row.id,
      actorName: row.actor_name,
      field: row.field,
      oldValue: row.old_value,
      newValue: row.new_value,
      createdAt: row.created_at,
    });
  }

  return {
    success: true,
    activities,
  };
}