import type { Ticket } from "@/types/ticket";

export const mockTickets: Ticket[] = [
  {
    id: "demo-ticket-1",
    number: 1042,
    subject: "حسابي لم يتفعّل بعد الاشتراك",
    status: "open",
    priority: "normal",
    customerId: "demo-customer-1",
    assigneeId: null,
    createdAt: "2026-10-28T08:00:00Z",
  },
  {
    id: "demo-ticket-2",
    number: 1043,
    subject: "تظهر رسالة خطأ عند رفع صورة",
    status: "in_progress",
    priority: "high",
    customerId: "demo-customer-2",
    assigneeId: "demo-agent-1",
    createdAt: "2026-10-01T08:00:00Z",
  },
];