import type { Request } from "express";
import { verifyAuthToken } from "./auth.js";

const COOKIE_NAME = "initiative_forge_session";

export function getAuthUser(req: Request) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}