import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { APP_USERS } from "../users";

interface UserContextValue {
  user: User;
  users: User[];
  setUser: (user: User) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  children,
  initialUser = APP_USERS[0],
}: {
  children: ReactNode;
  initialUser?: User;
}) {
  const [user, setUser] = useState<User>(initialUser);
  const value = useMemo(() => ({ user, users: APP_USERS, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
