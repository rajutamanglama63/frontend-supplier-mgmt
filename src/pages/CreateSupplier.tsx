/**
 * Create-supplier form: company name, VAT ID, country, contact email.
 * Client-side validation; keeps field values on duplicate-VAT errors.
 */

import { Navigate } from "react-router-dom";
import { CreateSupplierForm } from "../components/CreateSupplierForm";
import { useUser } from "../context/UserContext";

export function CreateSupplier() {
  const { user } = useUser();

  // Approvers cannot create suppliers. Send them home if they open this URL.
  if (user.role !== "requester") {
    return <Navigate to="/" replace />;
  }

  return (
    <section>
      <h1 className="mb-6 text-xl font-semibold">Create supplier</h1>
      <CreateSupplierForm />
    </section>
  );
}
