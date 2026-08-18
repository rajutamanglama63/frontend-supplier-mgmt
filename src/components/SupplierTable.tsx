import { useNavigate } from "react-router-dom";
import type { KeyboardEvent } from "react";
import type { Supplier } from "../types";
import { userName } from "../users";
import { StatusBadge } from "./StatusBadge";

export function SupplierTable({ suppliers }: { suppliers: Supplier[] }) {
  const navigate = useNavigate();

  if (suppliers.length === 0) {
    return (
      <p className="rounded-xl border border-black/10 bg-white px-4 py-8 text-center text-sm text-zinc-500">
        No suppliers yet.
      </p>
    );
  }

  function openSupplier(id: string) {
    navigate(`/suppliers/${id}`);
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSupplier(id);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
      <table className="w-full min-w-160 border-collapse text-left text-sm">
        <thead className="border-b border-black/10 bg-stone-50 text-xs font-medium tracking-wide text-zinc-500 uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">VAT ID</th>
            <th className="px-4 py-3 font-medium">Country</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created by</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr
              key={supplier.id}
              tabIndex={0}
              role="link"
              aria-label={`View ${supplier.companyName}`}
              className="cursor-pointer border-b border-black/5 last:border-b-0 hover:bg-stone-50"
              onClick={() => openSupplier(supplier.id)}
              onKeyDown={(event) => handleRowKeyDown(event, supplier.id)}
            >
              <td className="px-4 py-3 font-medium text-zinc-900">{supplier.companyName}</td>
              <td className="px-4 py-3 text-zinc-600">{supplier.vatId}</td>
              <td className="px-4 py-3 text-zinc-600">{supplier.country}</td>
              <td className="px-4 py-3">
                <StatusBadge status={supplier.status} />
              </td>
              <td className="px-4 py-3 text-zinc-600">{userName(supplier.createdBy)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
