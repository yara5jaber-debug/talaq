import type { TicketMessage } from "@/types/ticket";

export const mockMessages: TicketMessage[] = [
  {
    id: "message-1",
    ticketId: "demo-ticket-1",
    authorName: "سارة أحمد",
    authorRole: "customer",
    kind: "reply",
    body: "مرحبًا، اشتركت بالخدمة لكن حسابي ما زال غير مفعّل. تظهر لي رسالة تطلب تفعيل الاشتراك عند تسجيل الدخول.",
    createdAt: "2026-10-28T08:00:00Z",
  },
  {
    id: "message-2",
    ticketId: "demo-ticket-2",
    authorName: "أحمد خالد",
    authorRole: "customer",
    kind: "reply",
    body: "تظهر رسالة خطأ كلما حاولت رفع صورة للملف الشخصي. الصورة بصيغة PNG وحجمها تقريبًا 2MB.",
    createdAt: "2026-10-28T09:00:00Z",
  },
  {
    id: "message-3",
    ticketId: "demo-ticket-2",
    authorName: "يارا",
    authorRole: "agent",
    kind: "reply",
    body: "أهلًا أحمد، سأتابع المشكلة معك. هل يمكنك إرسال نص رسالة الخطأ واسم المتصفح المستخدم؟",
    createdAt: "2026-10-28T09:10:00Z",
  },
  {
    id: "message-4",
    ticketId: "demo-ticket-2",
    authorName: "يارا",
    authorRole: "agent",
    kind: "internal_note",
    body: "نحتاج إلى التحقق من إعدادات رفع الصور إذا استمرت المشكلة بعد تجربة متصفح آخر.",
    createdAt: "2026-10-28T09:12:00Z",
  },
];