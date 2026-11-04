"use server";

import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export interface SavedMessage {
  id: string;
  body: string;
  kind: "reply" | "internal_note";
  authorLabel: string;
  createdAt: string;
}

type ConversationResult =
  | {
      success: true;
      messages: SavedMessage[];
      canWriteInternal: boolean;
    }
  | { success: false; error: string };

type SendResult =
  | { success: true; message: SavedMessage }
  | { success: false; error: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getTicketMessages(
  ticketId: string,
): Promise<ConversationResult> {
  const { user, profile } = await requireUser();

  if (typeof ticketId !== "string" || !uuidPattern.test(ticketId)) {
    return { success: false, error: "رقم الطلب غير صالح." };
  }

  const supabase = await createClient();

  // سياسات قاعدة البيانات تمنع قراءة طلب غير مسموح للمستخدم.
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, customer_id")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    return {
      success: false,
      error: "الطلب غير متاح أو لا تملك صلاحية الوصول إليه.",
    };
  }

  const canWriteInternal =
    profile.role === "admin" || profile.role === "agent";

  let query = supabase
    .from("ticket_messages")
    .select("id, body, kind, author_id, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(200);

  // حماية إضافية؛ RLS يمنع الملاحظات الداخلية عن العميل أيضًا.
  if (!canWriteInternal) {
    query = query.eq("kind", "reply");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Load messages failed:", error.code, error.message);

    return { success: false, error: "تعذّر تحميل المحادثة." };
  }

  const messages: SavedMessage[] = [];

  for (const row of [...(data ?? [])].reverse()) {
    if (row.kind !== "reply" && row.kind !== "internal_note") {
      return { success: false, error: "نوع رسالة غير معروف." };
    }

    messages.push({
      id: row.id,
      body: row.body,
      kind: row.kind,
      createdAt: row.created_at,
      authorLabel:
        row.author_id === user.id
          ? "أنت"
          : row.author_id === ticket.customer_id
            ? "العميل"
            : "فريق الدعم",
    });
  }

  return { success: true, messages, canWriteInternal };
}

export async function sendTicketMessage(
  ticketId: string,
  body: string,
  kind: "reply" | "internal_note",
): Promise<SendResult> {
  const { profile } = await requireUser();

  if (
    typeof ticketId !== "string" ||
    !uuidPattern.test(ticketId) ||
    typeof body !== "string" ||
    (kind !== "reply" && kind !== "internal_note")
  ) {
    return { success: false, error: "بيانات الرسالة غير صالحة." };
  }

  const cleanBody = body.trim();

  if (cleanBody.length < 1 || cleanBody.length > 3000) {
    return {
      success: false,
      error: "اكتب رسالة من حرف واحد إلى 3000 حرف.",
    };
  }

  if (kind === "internal_note" && profile.role === "customer") {
    return {
      success: false,
      error: "الملاحظات الداخلية متاحة لفريق الدعم فقط.",
    };
  }

  const supabase = await createClient();

  // هوية الكاتب ووقت الإرسال من قاعدة البيانات.
  // RLS يتحقق من صلاحية الكتابة على الطلب.
  const { data, error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: ticketId,
      body: cleanBody,
      kind,
    })
    .select("id, body, kind, created_at")
    .single();

  if (error) {
    console.error("Send message failed:", error.code, error.message);

    return {
      success: false,
      error: "تعذّر إرسال الرسالة. تحقق من صلاحيتك على الطلب وحاول مجددًا.",
    };
  }

  return {
    success: true,
    message: {
      id: data.id,
      body: data.body,
      kind,
      createdAt: data.created_at,
      authorLabel: "أنت",
    },
  };
}