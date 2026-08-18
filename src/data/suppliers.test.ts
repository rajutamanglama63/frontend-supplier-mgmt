import { beforeEach, describe, expect, test } from "vitest";
import {
  approveSupplier,
  createSupplier,
  listSuppliers,
  rejectSupplier,
  STORAGE_KEY,
  submitSupplier,
} from "./suppliers";
import { APP_USERS } from "../users";
import type { CreateSupplierInput } from "../types";

const anna = APP_USERS[0];
const max = APP_USERS[1];

const sample: CreateSupplierInput = {
  companyName: "Sample Ltd.",
  vatId: "DE123456789",
  country: "Germany",
  contactEmail: "ops@sample.example",
};

describe("supplier data layer", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  test("creates a supplier as PENDING_APPROVAL when saved", async () => {
    const supplier = await createSupplier(anna, sample);

    expect(supplier.status).toBe("PENDING_APPROVAL");
    expect(supplier.createdBy).toBe("anna");
    expect(supplier.companyName).toBe("Sample Ltd.");
    await expect(listSuppliers()).resolves.toHaveLength(1);
  });

  test("creates a supplier as DRAFT when saved as a draft", async () => {
    const supplier = await createSupplier(anna, sample, "DRAFT");

    expect(supplier.status).toBe("DRAFT");
    expect(supplier.createdBy).toBe("anna");

    const submitted = await submitSupplier(anna, supplier.id);
    expect(submitted.status).toBe("PENDING_APPROVAL");
  });

  test("rejects a duplicate VAT ID even with extra whitespace", async () => {
    await createSupplier(anna, sample);

    await expect(
      createSupplier(anna, { ...sample, companyName: "Other Ltd.", vatId: "  de123456789  " }),
    ).rejects.toMatchObject({
      code: "VAT_ID_ALREADY_EXISTS",
    });

    await expect(listSuppliers()).resolves.toHaveLength(1);
  });

  test("prevents the creator from approving their own supplier", async () => {
    const created = await createSupplier(anna, sample);

    await expect(approveSupplier(anna, created.id)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });

    const asApprover = { ...anna, role: "approver" as const };
    await expect(approveSupplier(asApprover, created.id)).rejects.toMatchObject({
      code: "SELF_APPROVAL_NOT_ALLOWED",
    });
  });

  test("prevents rejection without a reason and keeps the supplier pending", async () => {
    const created = await createSupplier(anna, sample);

    await expect(rejectSupplier(max, created.id, "   ")).rejects.toMatchObject({
      code: "REJECTION_REASON_REQUIRED",
    });

    const [current] = await listSuppliers();
    expect(current.status).toBe("PENDING_APPROVAL");
    expect(current.rejectionReason).toBeUndefined();
  });

  test("allows Max to approve a submitted supplier", async () => {
    const created = await createSupplier(anna, sample);

    const approved = await approveSupplier(max, created.id);

    expect(approved.status).toBe("APPROVED");
    expect(approved.approvedBy).toBe("max");
  });
});
