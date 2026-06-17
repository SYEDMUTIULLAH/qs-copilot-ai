/**
 * Shared Type Definitions for QS Copilot AI
 */

export type UserRole =
  | "Admin"
  | "Senior Quantity Surveyor"
  | "Quantity Surveyor"
  | "Planning Engineer"
  | "Procurement Engineer"
  | "Project Manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface QSProject {
  id: string;
  name: string;
  contractNumber: string;
  client: string;
  consultant: string;
  contractValue: number;
  currency: string;
  startDate: string;
  completionDate: string;
  status: "Active" | "Completed" | "Delayed" | "Draft";
}

export interface QSDocument {
  id: string;
  projectId: string;
  name: string;
  type: "Tender BOQ" | "CostX Excel" | "Previous VP" | "IFC Revision" | "Quotation" | "Specification" | "Invoice";
  version: string;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  extractedItemsCount?: number;
}

export interface BOQItem {
  id: string;
  projectId: string;
  billRef: string; // e.g., "1.1.1"
  description: string;
  unit: string;
  originalQty: number;
  claimedQty: number;
  remainingQty: number;
  rate: number;
  totalAmount: number;
  materialId?: string;
}

export interface Variation {
  id: string;
  projectId: string;
  title: string;
  refNumber: string;
  status: "Pending" | "SqsApproved" | "ClientApproved" | "Rejected";
  variationValue: number;
  justification: string;
  claimSummary: string;
  createdDate: string;
  lastUpdated: string;
  approvedBy?: string;
}

export interface VariationItem {
  id: string;
  variationId: string;
  boqItemRef?: string;
  description: string;
  unit: string;
  tenderQty: number;
  ifcQty: number;
  claimedQty: number;
  rate: number;
  additionQty: number;
  omissionQty: number;
  netQty: number;
  amount: number;
}

export interface ProcurementAlert {
  id: string;
  projectId: string;
  materialName: string;
  requiredQty: number;
  currentStock: number;
  shortage: number;
  recommendedOrderQty: number;
  priority: "High" | "Medium" | "Low";
  status: "Pending Order" | "In Procurement" | "Ordered" | "Delivered";
  unit: string;
  boqItemRef?: string;
}

export interface VPRecord {
  id: string;
  projectId: string;
  vpNumber: number;
  claimDate: string;
  claimAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  status: "Draft" | "Submitted" | "Certified" | "Paid";
  remainingBalance: number;
  approvedDate?: string;
  auditTrail: string[];
}

export interface RiskLog {
  id: string;
  projectId: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  description: string;
  resolution?: string;
  identifiedDate: string;
}

export interface QSNotification {
  id: string;
  projectId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "procurement" | "variation" | "vp" | "system";
}

export interface AuditLog {
  id: string;
  projectId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
