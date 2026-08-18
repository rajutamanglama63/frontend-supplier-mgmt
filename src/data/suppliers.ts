/**
 * Supplier data access — localStorage instead of HTTP.
 * Screens depend on these functions, not on storage details, so a real API
 * could replace this module later without changing the UI.
 */

import type { CreateSupplierInput, Supplier, SupplierStatus, User } from "../types";
import { validateCreateInput, validateRejectionReason } from "../validation/supplierForm";
import { StorageError } from "./errors";

export const STORAGE_KEY = "frontend-supplier-mgmt.suppliers";

function delay(): Promise<void> {
  if (import.meta.env.MODE === "test") {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, 180));
}

function vatKey(vatId: string): string {
  return vatId.trim().toUpperCase();
}

function readAll(): Supplier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid store");
    }
    return parsed as Supplier[];
  } catch {
    throw new StorageError(
      "VALIDATION_ERROR",
      "Could not read saved suppliers. The stored data may be corrupted.",
    );
  }
}

function writeAll(suppliers: Supplier[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
}

function requireSupplier(id: string): Supplier {
  const supplier = readAll().find((item) => item.id === id);
  if (!supplier) {
    throw new StorageError("SUPPLIER_NOT_FOUND", "Supplier was not found.");
  }
  return supplier;
}

function replaceSupplier(updated: Supplier): Supplier {
  writeAll(readAll().map((item) => (item.id === updated.id ? updated : item)));
  return updated;
}

export async function listSuppliers(): Promise<Supplier[]> {
  await delay();
  return [...readAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSupplierById(id: string): Promise<Supplier> {
  await delay();
  return requireSupplier(id);
}

export async function createSupplier(
  currentUser: User,
  input: CreateSupplierInput,
  status: Extract<SupplierStatus, "DRAFT" | "PENDING_APPROVAL"> = "PENDING_APPROVAL",
): Promise<Supplier> {
  await delay();

  const parsed = validateCreateInput(input);
  if (!parsed.ok) {
    const message = Object.values(parsed.fields)[0] ?? "Please check the form.";
    throw new StorageError("VALIDATION_ERROR", message);
  }

  const suppliers = readAll();
  const duplicate = suppliers.some((item) => vatKey(item.vatId) === vatKey(parsed.value.vatId));
  if (duplicate) {
    throw new StorageError(
      "VAT_ID_ALREADY_EXISTS",
      `A supplier with VAT ID ${parsed.value.vatId} already exists.`,
    );
  }

  const supplier: Supplier = {
    id: crypto.randomUUID(),
    companyName: parsed.value.companyName,
    vatId: parsed.value.vatId,
    country: parsed.value.country,
    contactEmail: parsed.value.contactEmail,
    status,
    createdBy: currentUser.id,
    createdAt: new Date().toISOString(),
  };

  writeAll([supplier, ...suppliers]);
  return supplier;
}

export async function submitSupplier(currentUser: User, id: string): Promise<Supplier> {
  await delay();
  const supplier = requireSupplier(id);

  if (currentUser.role !== "requester") {
    throw new StorageError("UNAUTHORIZED", "Only a requester can submit a supplier for approval.");
  }

  if (supplier.createdBy !== currentUser.id) {
    throw new StorageError("UNAUTHORIZED", "Only the creator can submit this supplier for approval.");
  }

  if (supplier.status !== "DRAFT") {
    throw new StorageError(
      "INVALID_STATUS_TRANSITION",
      `Supplier is ${supplier.status} and cannot be submitted.`,
    );
  }

  return replaceSupplier({ ...supplier, status: "PENDING_APPROVAL" });
}

function assertCanReview(supplier: Supplier, currentUser: User): void {
  if (currentUser.role !== "approver") {
    throw new StorageError("UNAUTHORIZED", "Only an approver can approve or reject a supplier.");
  }

  if (supplier.status !== "PENDING_APPROVAL") {
    throw new StorageError(
      "INVALID_STATUS_TRANSITION",
      `Supplier is ${supplier.status} and cannot be reviewed.`,
    );
  }

  if (supplier.createdBy === currentUser.id) {
    throw new StorageError(
      "SELF_APPROVAL_NOT_ALLOWED",
      "The creator of a supplier cannot approve or reject the same supplier.",
    );
  }
}

export async function approveSupplier(currentUser: User, id: string): Promise<Supplier> {
  await delay();
  const supplier = requireSupplier(id);
  assertCanReview(supplier, currentUser);

  return replaceSupplier({
    ...supplier,
    status: "APPROVED",
    approvedBy: currentUser.id,
    rejectedBy: undefined,
    rejectionReason: undefined,
  });
}

export async function rejectSupplier(
  currentUser: User,
  id: string,
  reason: string,
): Promise<Supplier> {
  await delay();
  const supplier = requireSupplier(id);
  assertCanReview(supplier, currentUser);

  const reasonError = validateRejectionReason(reason);
  if (reasonError) {
    throw new StorageError("REJECTION_REASON_REQUIRED", reasonError);
  }

  return replaceSupplier({
    ...supplier,
    status: "REJECTED",
    rejectedBy: currentUser.id,
    rejectionReason: reason.trim(),
    approvedBy: undefined,
  });
}
