import { Link } from "react-router-dom";
import { UserSwitcher } from "../UserSwitcher";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between px-(--spacing-page) py-2.5">
        <Link
          to="/"
          className="text-lg font-semibold text-zinc-900 no-underline"
          aria-label="Suppliers home"
        >
          Suppliers
        </Link>
        <UserSwitcher />
      </div>
    </header>
  );
}
