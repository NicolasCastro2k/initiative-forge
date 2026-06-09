import type { PublicUser } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export {};