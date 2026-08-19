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
  /** Working estimate for outstanding work, e.g. "6 hours". */
  estimatedTime?: string;
  /** Set on items that roll up into a parent, so the UI can nest them. */
  parentId?: string;
  /** True when this row's estimate is the sum of its nested items. */
  rollsUp?: boolean;
  completedAt?: string;
}

export interface ProjectData {
  contactId: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  description: string;
  totalCost: number;
  /** Amount received to date. Falls back to a half-split when absent. */
  amountPaid?: number;
  /** Outstanding balance carried by the most recent invoice. */
  balanceDue?: number;
  downpaymentPaid: boolean;
  finalPaymentPaid: boolean;
  deliverables: Deliverable[];
  createdAt: string;
  updatedAt: string;
}
