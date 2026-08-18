import type { Supplier, User } from "./types";

/** Requester may submit a draft so it becomes pending approval. */
export function canSubmit(supplier: Supplier, user: User): boolean {
  return supplier.status === "DRAFT" && user.role === "requester";
}

/** Approvers may approve or reject a supplier waiting for review. */
export function canReview(supplier: Supplier, user: User): boolean {
  return supplier.status === "PENDING_APPROVAL" && user.role === "approver";
}
