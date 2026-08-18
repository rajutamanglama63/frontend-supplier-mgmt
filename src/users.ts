import type { User } from "./types";

export const APP_USERS: User[] = [
  { id: "anna", name: "Anna Requester", role: "requester" },
  { id: "max", name: "Max Approver", role: "approver" },
];

export function userName(userId: string): string {
  return APP_USERS.find((user) => user.id === userId)?.name ?? userId;
}
