import type { ErrorCode } from "../types";

/** Domain error from the local data layer. Same shape a real API could return. */
export class StorageError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "StorageError";
  }
}
