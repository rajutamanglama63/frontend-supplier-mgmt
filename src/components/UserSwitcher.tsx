import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useUser } from "../context/UserContext";
import type { User } from "../types";

function roleLabel(role: User["role"]): string {
  return role === "requester" ? "Requester" : "Approver";
}

function UserRow({ user }: { user: User }) {
  const tone = user.id === "anna" ? "bg-teal-700" : "bg-indigo-600";

  return (
    <>
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white ${tone}`}
      >
        {user.name.charAt(0)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm leading-tight font-semibold">{user.name}</span>
        <span className="text-xs leading-tight text-zinc-500">{roleLabel(user.role)}</span>
      </span>
    </>
  );
}

export function UserSwitcher() {
  const { user, users, setUser } = useUser();

  return (
    <Listbox value={user} by="id" onChange={setUser}>
      <ListboxButton className="group flex items-center gap-2.5 rounded-full py-1.5 pr-2.5 pl-1.5 text-left hover:bg-black/5 data-open:bg-black/5">
        <UserRow user={user} />
        <svg
          className="text-zinc-500 transition-transform group-data-open:rotate-180"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6.5L8 10.5L12 6.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </ListboxButton>
      <ListboxOptions
        anchor="bottom start"
        className="z-30 min-w-52 rounded-xl border border-black/10 bg-white p-1.5 shadow-lg [--anchor-gap:8px]"
      >
        {users.map((option) => (
          <ListboxOption
            key={option.id}
            value={option}
            className="group flex cursor-pointer items-center gap-2.5 rounded-lg py-1.5 pr-2.5 pl-1.5 data-focus:bg-black/5 data-selected:bg-teal-700/10"
          >
            <UserRow user={option} />
            <span className="ml-auto hidden text-teal-700 group-data-selected:inline">✓</span>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
