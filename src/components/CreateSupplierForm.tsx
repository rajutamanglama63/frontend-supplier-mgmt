import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StorageError } from "../data/errors";
import { createSupplier } from "../data/suppliers";
import { useUser } from "../context/UserContext";
import { COUNTRIES, validateCreateInput } from "../validation/supplierForm";
import type { CreateSupplierInput, FieldErrors } from "../types";

const fieldClass =
  "mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400";

const errorFieldClass =
  "mt-1 w-full rounded-lg border border-red-400 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-red-500";

const emptyForm: CreateSupplierInput = {
  companyName: "",
  vatId: "",
  country: "",
  contactEmail: "",
};

export function CreateSupplierForm() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [values, setValues] = useState<CreateSupplierInput>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"draft" | "pending" | null>(null);

  function updateField<K extends keyof CreateSupplierInput>(key: K, value: CreateSupplierInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function saveSupplier(status: "DRAFT" | "PENDING_APPROVAL") {
    setFormError(null);

    const parsed = validateCreateInput(values);
    if (!parsed.ok) {
      setFieldErrors(parsed.fields);
      return;
    }

    setFieldErrors({});
    setSaving(status === "DRAFT" ? "draft" : "pending");

    try {
      await createSupplier(user, parsed.value, status);
      navigate("/");
    } catch (err) {
      if (err instanceof StorageError && err.code === "VAT_ID_ALREADY_EXISTS") {
        setFieldErrors({ vatId: err.message });
      } else {
        setFormError(err instanceof Error ? err.message : "Could not create supplier.");
      }
    } finally {
      setSaving(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSupplier("PENDING_APPROVAL");
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="w-full space-y-4 rounded-xl border border-black/10 bg-white p-5"
    >
      <div>
        <label className="block text-sm font-medium text-zinc-700" htmlFor="companyName">
          Company name
        </label>
        <input
          id="companyName"
          className={fieldErrors.companyName ? errorFieldClass : fieldClass}
          name="companyName"
          type="text"
          value={values.companyName}
          onChange={(event) => updateField("companyName", event.target.value)}
          aria-invalid={Boolean(fieldErrors.companyName)}
          aria-describedby={fieldErrors.companyName ? "companyName-error" : undefined}
        />
        {fieldErrors.companyName && (
          <p id="companyName-error" className="mt-1 text-sm text-red-700">
            {fieldErrors.companyName}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700" htmlFor="vatId">
          VAT ID
        </label>
        <input
          id="vatId"
          className={fieldErrors.vatId ? errorFieldClass : fieldClass}
          name="vatId"
          type="text"
          value={values.vatId}
          onChange={(event) => updateField("vatId", event.target.value)}
          aria-invalid={Boolean(fieldErrors.vatId)}
          aria-describedby={fieldErrors.vatId ? "vatId-error" : undefined}
        />
        {fieldErrors.vatId && (
          <p id="vatId-error" className="mt-1 text-sm text-red-700">
            {fieldErrors.vatId}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700" htmlFor="country">
          Country
        </label>
        <select
          id="country"
          className={fieldErrors.country ? errorFieldClass : fieldClass}
          name="country"
          value={values.country}
          onChange={(event) => updateField("country", event.target.value)}
          aria-invalid={Boolean(fieldErrors.country)}
          aria-describedby={fieldErrors.country ? "country-error" : undefined}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {fieldErrors.country && (
          <p id="country-error" className="mt-1 text-sm text-red-700">
            {fieldErrors.country}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700" htmlFor="contactEmail">
          Contact email
        </label>
        <input
          id="contactEmail"
          className={fieldErrors.contactEmail ? errorFieldClass : fieldClass}
          name="contactEmail"
          type="email"
          value={values.contactEmail}
          onChange={(event) => updateField("contactEmail", event.target.value)}
          aria-invalid={Boolean(fieldErrors.contactEmail)}
          aria-describedby={fieldErrors.contactEmail ? "contactEmail-error" : undefined}
        />
        {fieldErrors.contactEmail && (
          <p id="contactEmail-error" className="mt-1 text-sm text-red-700">
            {fieldErrors.contactEmail}
          </p>
        )}
      </div>

      {formError && <p className="text-sm text-red-700">{formError}</p>}

      <div className="flex items-center gap-3 pt-1">
        <Link to="/" className="text-sm text-zinc-500 no-underline hover:text-zinc-800">
          Cancel
        </Link>
        <button
          type="button"
          disabled={saving !== null}
          className="rounded-lg border border-black/15 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 hover:bg-stone-50 disabled:opacity-60"
          onClick={() => void saveSupplier("DRAFT")}
        >
          {saving === "draft" ? "Saving draft…" : "Save draft"}
        </button>
        <button
          type="submit"
          disabled={saving !== null}
          className="rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving === "pending" ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
