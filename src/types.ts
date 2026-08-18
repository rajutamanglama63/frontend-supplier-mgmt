export type SupplierStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";

export type UserRole = "requester" | "approver";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Supplier {
  id: string;
  companyName: string;
  vatId: string;
  country: string;
  contactEmail: string;
  status: SupplierStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface CreateSupplierInput {
  companyName: string;
  vatId: string;
  country: string;
  contactEmail: string;
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "SUPPLIER_NOT_FOUND"
  | "VAT_ID_ALREADY_EXISTS"
  | "INVALID_STATUS_TRANSITION"
  | "SELF_APPROVAL_NOT_ALLOWED"
  | "REJECTION_REASON_REQUIRED"
  | "UNAUTHORIZED";

export type SupplierFormField =
  | "companyName"
  | "vatId"
  | "country"
  | "contactEmail";

export type FieldErrors = Partial<Record<SupplierFormField, string>>;
