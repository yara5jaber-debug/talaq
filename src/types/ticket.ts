// أدوار المستخدمين
export type UserRole = "customer" | "agent" | "admin";

// الحالات التي يمر فيها طلب الدعم
export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_customer"
  | "resolved";

// مستويات أولوية الطلب
export type TicketPriority = "low" | "normal" | "high" | "urgent";

// الرد ظاهر للعميل، والملاحظة داخلية للفريق
export type MessageKind = "reply" | "internal_note";

// البيانات الأساسية التي نحتاجها لعرض طلب الدعم
export interface Ticket {
  id: string;
  number: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  assigneeId: string | null;
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorName: string;
  authorRole: UserRole;
  kind: MessageKind;
  body: string;
  createdAt: string;
}