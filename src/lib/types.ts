/** Shared types used across the application */

export interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  completedAt?: string;
}

export interface ProjectData {
  contactId: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  description: string;
  totalCost: number;
  downpaymentPaid: boolean;
  finalPaymentPaid: boolean;
  deliverables: Deliverable[];
  createdAt: string;
  updatedAt: string;
}
