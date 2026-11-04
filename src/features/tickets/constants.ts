import type {
  TicketPriority,
  TicketStatus,
} from "@/types/ticket";

export const ticketStatusLabels: Record<TicketStatus, string> = {
  open: "جديد",
  in_progress: "قيد المعالجة",
  waiting_customer: "بانتظار العميل",
  resolved: "تم الحل",
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  low: "منخفضة",
  normal: "عادية",
  high: "عالية",
  urgent: "عاجلة",
};