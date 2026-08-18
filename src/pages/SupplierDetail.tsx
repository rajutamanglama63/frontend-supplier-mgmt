/**
 * Supplier detail. Requesters can save a draft (status becomes pending).
 * Approvers can approve or reject a pending supplier.
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SupplierActions } from "../components/SupplierActions";
import { StatusBadge } from "../components/StatusBadge";
import { useUser } from "../context/UserContext";
import { StorageError } from "../data/errors";
import { getSupplierById } from "../data/suppliers";
import type { Supplier } from "../types";
import { userName } from "../users";

export function SupplierDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;

    async function loadSupplier() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await getSupplierById(id!);
        if (!cancelled) {
          setSupplier(data);
        }
      } catch (err) {
        if (cancelled) return;
        setSupplier(null);
        if (err instanceof StorageError && err.code === "SUPPLIER_NOT_FOUND") {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Could not load supplier.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSupplier();
    return () => {
      cancelled = true;
    };
  }, [id, user.id]);

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading supplier…</p>;
  }

  if (error) {
    return (
      <section>
        <p className="text-sm text-zinc-700">{error}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-zinc-500 no-underline hover:text-zinc-800">
          Back to suppliers
        </Link>
      </section>
    );
  }

  if (notFound || !supplier) {
    return (
      <section>
        <h1 className="text-xl font-semibold">Supplier not found</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-zinc-500 no-underline hover:text-zinc-800">
          Back to suppliers
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{supplier.companyName}</h1>
        <StatusBadge status={supplier.status} />
      </div>

      <div className="space-y-6 rounded-xl border border-black/10 bg-white p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">VAT ID</dt>
            <dd className="mt-1 text-sm text-zinc-900">{supplier.vatId}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Country</dt>
            <dd className="mt-1 text-sm text-zinc-900">{supplier.country}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Contact email</dt>
            <dd className="mt-1 text-sm text-zinc-900">{supplier.contactEmail}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Created by</dt>
            <dd className="mt-1 text-sm text-zinc-900">{userName(supplier.createdBy)}</dd>
          </div>
          {supplier.approvedBy && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Approved by</dt>
              <dd className="mt-1 text-sm text-zinc-900">{userName(supplier.approvedBy)}</dd>
            </div>
          )}
          {supplier.rejectedBy && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Rejected by</dt>
              <dd className="mt-1 text-sm text-zinc-900">{userName(supplier.rejectedBy)}</dd>
            </div>
          )}
          {supplier.rejectionReason && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                Rejection reason
              </dt>
              <dd className="mt-1 text-sm text-zinc-900">{supplier.rejectionReason}</dd>
            </div>
          )}
        </dl>

        <SupplierActions supplier={supplier} onSupplierChange={setSupplier} />
      </div>

      <Link to="/" className="mt-4 inline-block text-sm text-zinc-500 no-underline hover:text-zinc-800">
        Back to suppliers
      </Link>
    </section>
  );
}
