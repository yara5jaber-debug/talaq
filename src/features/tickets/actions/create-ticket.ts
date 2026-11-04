"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

type CreateTicketResult =
  | { success: true; number: number }
  | { success: false; error: string };

export async function createTicket(
  subject: string,
  description: string,
): Promise<CreateTicketResult> {
  await requireRole(["customer"]);

  if (typeof subject !== "string" || typeof description !== "string") {
    return { success: false, error: "بيانات الطلب غير صالحة." };
  }

  const cleanSubject = subject.trim();
  const cleanDescription = description.trim();

  if (cleanSubject.length < 5 || cleanSubject.length > 120) {
    return {
      success: false,
      error: "اكتبي عنوانًا من 5 إلى 120 حرفًا.",
    };
  }

  if (cleanDescription.length < 20 || cleanDescription.length > 3000) {
    return {
      success: false,
      error: "اكتبي تفاصيل من 20 إلى 3000 حرف.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      subject: cleanSubject,
      description: cleanDescription,
    })
    .select("number")
    .single();

  if (error) {
    console.error("Create ticket failed:", error.code, error.message);

    return {
      success: false,
      error: "تعذّر حفظ الطلب. حاولي مرة أخرى.",
    };
  }

  revalidatePath("/support");

  return { success: true, number: data.number };
}