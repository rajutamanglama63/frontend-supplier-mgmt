import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/shared/Navbar";
import { UserProvider } from "./context/UserContext";
import { CreateSupplier } from "./pages/CreateSupplier";
import { SupplierDetail } from "./pages/SupplierDetail";
import { SupplierList } from "./pages/SupplierList";

export function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <div className="min-h-screen bg-stone-100 font-sans text-zinc-900 antialiased">
          <Navbar />
          <main className="px-(--spacing-page) py-8">
            <Routes>
              <Route path="/" element={<SupplierList />} />
              <Route path="/suppliers/new" element={<CreateSupplier />} />
              <Route path="/suppliers/:id" element={<SupplierDetail />} />
            </Routes>
          </main>
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}
