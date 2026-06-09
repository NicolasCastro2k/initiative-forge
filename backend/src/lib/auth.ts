import { createRequire } from "node:module";
import type { PublicUser } from "../types/auth.js";

const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export function createAuthToken(user: PublicUser) {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string): PublicUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload !== "object" || !payload) {
      return null;
    }

    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
    };
  } catch {
    return null;
  }
}