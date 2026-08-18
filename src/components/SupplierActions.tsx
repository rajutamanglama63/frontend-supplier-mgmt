import { type FormEvent, useState } from "react";
import { StorageError } from "../data/errors";
import { approveSupplier, rejectSupplier, submitSupplier } from "../data/suppliers";
import { useUser } from "../context/UserContext";
import { validateRejectionReason } from "../validation/supplierForm";
import { canReview, canSubmit } from "../workflow";
import type { Supplier } from "../types";

const fieldClass =
  "mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400";

const errorFieldClass =
  "mt-1 w-full rounded-lg border border-red-400 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-red-500";

export function SupplierActions({
  supplier,
  onSupplierChange,
}: {
  supplier: Supplier;
  onSupplierChange: (supplier: Supplier) => void;
}) {
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);

    try {
      const updated = await submitSupplier(user, supplier.id);
      onSupplierChange(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save supplier.");
    } finally {
      setSaving(false);
    }
  }

  if (canSubmit(supplier, user)) {
    return (
      <div className="space-y-3 border-t border-black/10 pt-4">
        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    );
  }

  if (!canReview(supplier, user)) {
    return null;
  }

  async function handleApprove() {
    setError(null);
    setReasonError(null);
    setSaving(true);

    try {
      const updated = await approveSupplier(user, supplier.id);
      onSupplierChange(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve supplier.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationMessage = validateRejectionReason(reason);
    if (validationMessage) {
      setReasonError(validationMessage);
      return;
    }

    setReasonError(null);
    setSaving(true);

    try {
      const updated = await rejectSupplier(user, supplier.id, reason);
      onSupplierChange(updated);
      setReason("");
    } catch (err) {
      if (err instanceof StorageError && err.code === "REJECTION_REASON_REQUIRED") {
        setReasonError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Could not reject supplier.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form noValidate onSubmit={handleReject} className="space-y-3 border-t border-black/10 pt-4">
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-700" htmlFor="rejectionReason">
          Rejection reason
        </label>
        <textarea
          id="rejectionReason"
          className={reasonError ? errorFieldClass : fieldClass}
          name="reason"
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          aria-invalid={Boolean(reasonError)}
          aria-describedby={reasonError ? "rejectionReason-error" : undefined}
        />
        {reasonError && (
          <p id="rejectionReason-error" className="mt-1 text-sm text-red-700">
            {reasonError}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handleApprove()}
          disabled={saving}
          className="rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Approve"}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-red-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </form>
  );
}
