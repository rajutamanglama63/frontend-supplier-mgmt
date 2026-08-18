import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SupplierTable } from "../components/SupplierTable";
import { useUser } from "../context/UserContext";
import { listSuppliers } from "../data/suppliers";
import type { Supplier } from "../types";

export function SupplierList() {
  const { user } = useUser();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRequester = user.role === "requester";

  async function loadSuppliers() {
    setLoading(true);
    setError(null);

    try {
      setSuppliers(await listSuppliers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load suppliers.");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSuppliers();
  }, [user.id]);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Suppliers</h1>
        {isRequester && (
          <Link
            to="/suppliers/new"
            className="rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white no-underline hover:bg-zinc-800"
          >
            Create supplier
          </Link>
        )}
      </div>

      {loading && <p className="text-sm text-zinc-500">Loading suppliers…</p>}

      {error && (
        <div className="rounded-xl border border-black/10 bg-white px-4 py-6 text-sm">
          <p className="text-zinc-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadSuppliers()}
            className="mt-3 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && <SupplierTable suppliers={suppliers} />}
    </section>
  );
}
