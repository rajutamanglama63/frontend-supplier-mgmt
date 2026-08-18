import type { CreateSupplierInput, FieldErrors } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const COUNTRIES = [
  "Germany",
  "Austria",
  "Switzerland",
  "Netherlands",
  "France",
  "Belgium",
  "Italy",
  "Spain",
  "Poland",
] as const;

export function trimSupplierInput(input: CreateSupplierInput): CreateSupplierInput {
  return {
    companyName: input.companyName.trim(),
    vatId: input.vatId.trim(),
    country: input.country.trim(),
    contactEmail: input.contactEmail.trim(),
  };
}

export function validateCreateInput(
  input: CreateSupplierInput,
): { ok: true; value: CreateSupplierInput } | { ok: false; fields: FieldErrors } {
  const value = trimSupplierInput(input);
  const fields: FieldErrors = {};

  if (!value.companyName) {
    fields.companyName = "Company name is required.";
  }
  if (!value.vatId) {
    fields.vatId = "VAT ID is required.";
  }
  if (!value.country) {
    fields.country = "Country is required.";
  }
  if (!value.contactEmail) {
    fields.contactEmail = "Contact email is required.";
  } else if (!EMAIL_PATTERN.test(value.contactEmail)) {
    fields.contactEmail = "Enter a valid email address.";
  }

  if (Object.keys(fields).length > 0) {
    return { ok: false, fields };
  }

  return { ok: true, value };
}

export function validateRejectionReason(reason: string): string | null {
  if (!reason.trim()) {
    return "A rejection reason is required.";
  }
  return null;
}
