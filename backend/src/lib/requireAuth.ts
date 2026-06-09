import type { Request, Response, NextFunction } from "express";
import { verifyAuthToken } from "./auth.js";

const COOKIE_NAME = "initiative_forge_session";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      message: "Debes iniciar sesión.",
    });
  }

  const user = verifyAuthToken(token);

  if (!user) {
    return res.status(401).json({
      message: "Sesión inválida.",
    });
  }

  req.user = user;

  return next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = req.user?.email.toLowerCase();

  if (!userEmail || !adminEmails.includes(userEmail)) {
    return res.status(403).json({
      message: "No tienes permisos para administrar usuarios.",
    });
  }

  return next();
}