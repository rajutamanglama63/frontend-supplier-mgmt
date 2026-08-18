import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SupplierActions } from "./SupplierActions";
import { createSupplier, STORAGE_KEY } from "../data/suppliers";
import { renderWithProviders } from "../test/render";
import type { CreateSupplierInput, Supplier } from "../types";
import { APP_USERS } from "../users";

const pending: Supplier = {
  id: "sup-pending",
  companyName: "Alpha AG",
  vatId: "DE987654321",
  country: "Germany",
  contactEmail: "contact@alpha.example",
  status: "PENDING_APPROVAL",
  createdBy: "anna",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const input: CreateSupplierInput = {
  companyName: "Alpha AG",
  vatId: "DE987654321",
  country: "Germany",
  contactEmail: "contact@alpha.example",
};

describe("SupplierActions", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  test("shows Save for a requester when the supplier is a draft", async () => {
    const created = await createSupplier(APP_USERS[0], input, "DRAFT");
    const onSupplierChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<SupplierActions supplier={created} onSupplierChange={onSupplierChange} />, {
      user: APP_USERS[0],
    });

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSupplierChange).toHaveBeenCalled());
    expect(onSupplierChange.mock.calls[0][0]).toMatchObject({
      status: "PENDING_APPROVAL",
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Supplier[];
    expect(stored[0].status).toBe("PENDING_APPROVAL");
  });

  test("hides approval actions for a requester on a pending supplier", () => {
    renderWithProviders(
      <SupplierActions supplier={pending} onSupplierChange={() => undefined} />,
      { user: APP_USERS[0] },
    );

    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Rejection reason")).not.toBeInTheDocument();
  });

  test("shows approve, reject, and a reason field for an approver", () => {
    renderWithProviders(<SupplierActions supplier={pending} onSupplierChange={() => undefined} />, {
      user: APP_USERS[1],
    });

    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.getByLabelText("Rejection reason")).toBeInTheDocument();
  });

  test("prevents rejection without a reason", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SupplierActions supplier={pending} onSupplierChange={() => undefined} />, {
      user: APP_USERS[1],
    });

    await user.click(screen.getByRole("button", { name: "Reject" }));

    expect(screen.getByText("A rejection reason is required.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });

  test("approve updates localStorage to APPROVED", async () => {
    const created = await createSupplier(APP_USERS[0], input);
    const onSupplierChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<SupplierActions supplier={created} onSupplierChange={onSupplierChange} />, {
      user: APP_USERS[1],
    });

    await user.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(onSupplierChange).toHaveBeenCalled());
    expect(onSupplierChange.mock.calls[0][0]).toMatchObject({
      status: "APPROVED",
      approvedBy: "max",
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Supplier[];
    expect(stored[0].status).toBe("APPROVED");
    expect(stored[0].approvedBy).toBe("max");
  });

  test("reject updates localStorage with REJECTED status and reason", async () => {
    const created = await createSupplier(APP_USERS[0], input);
    const onSupplierChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<SupplierActions supplier={created} onSupplierChange={onSupplierChange} />, {
      user: APP_USERS[1],
    });

    await user.type(screen.getByLabelText("Rejection reason"), "VAT could not be verified.");
    await user.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(onSupplierChange).toHaveBeenCalled());
    expect(onSupplierChange.mock.calls[0][0]).toMatchObject({
      status: "REJECTED",
      rejectedBy: "max",
      rejectionReason: "VAT could not be verified.",
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Supplier[];
    expect(stored[0].status).toBe("REJECTED");
    expect(stored[0].rejectionReason).toBe("VAT could not be verified.");
  });
});
