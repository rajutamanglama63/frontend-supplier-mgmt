import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement, ReactNode } from "react";
import { UserProvider } from "../context/UserContext";
import type { User } from "../types";
import { APP_USERS } from "../users";

type ExtraOptions = {
  user?: User;
  route?: string;
};

export function renderWithProviders(
  ui: ReactElement,
  options: ExtraOptions & Omit<RenderOptions, "wrapper"> = {},
) {
  const { user = APP_USERS[0], route = "/", ...renderOptions } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <UserProvider initialUser={user}>{children}</UserProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
