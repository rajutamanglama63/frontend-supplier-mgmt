import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { CreateSupplierForm } from "./CreateSupplierForm";
import { createSupplier, STORAGE_KEY } from "../data/suppliers";
import { renderWithProviders } from "../test/render";
import { APP_USERS } from "../users";

describe("CreateSupplierForm", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  test("shows required-field messages and keeps the form open", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateSupplierForm />, { route: "/suppliers/new" });

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Company name is required.")).toBeInTheDocument();
    expect(screen.getByText("VAT ID is required.")).toBeInTheDocument();
    expect(screen.getByText("Country is required.")).toBeInTheDocument();
    expect(screen.getByText("Contact email is required.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  test("keeps entered values when a duplicate VAT ID is rejected", async () => {
    await createSupplier(APP_USERS[0], {
      companyName: "Sample Ltd.",
      vatId: "DE123456789",
      country: "Germany",
      contactEmail: "ops@sample.example",
    });

    const user = userEvent.setup();
    renderWithProviders(<CreateSupplierForm />, { route: "/suppliers/new" });

    await user.type(screen.getByLabelText("Company name"), "Alpha AG");
    await user.type(screen.getByLabelText("VAT ID"), "DE123456789");
    await user.selectOptions(screen.getByLabelText("Country"), "Germany");
    await user.type(screen.getByLabelText("Contact email"), "contact@alpha.example");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("A supplier with VAT ID DE123456789 already exists."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Company name")).toHaveValue("Alpha AG");
    expect(screen.getByLabelText("VAT ID")).toHaveValue("DE123456789");
    expect(screen.getByLabelText("Contact email")).toHaveValue("contact@alpha.example");
  });
});
