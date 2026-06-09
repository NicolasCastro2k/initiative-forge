import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { createAuthToken, verifyAuthToken } from "../lib/auth.js";

export const authRouter = Router();

const COOKIE_NAME = "initiative_forge_session";

function getIsAdmin(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((adminEmail) => adminEmail.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.toLowerCase());
}

authRouter.post("/login", async (req, res) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  if (!email || !password) {
    return res.status(400).json({
      message: "Correo y contraseña son obligatorios.",
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({
      message: "Credenciales inválidas.",
    });
  }

  const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordIsValid) {
    return res.status(401).json({
      message: "Credenciales inválidas.",
    });
  }

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  const token = createAuthToken(publicUser);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return res.json({
    user: {
      ...publicUser,
      isAdmin: getIsAdmin(publicUser.email),
    },
  });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    path: "/",
  });

  return res.json({
    ok: true,
  });
});

authRouter.get("/me", (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      user: null,
    });
  }

  const user = verifyAuthToken(token);

  if (!user) {
    return res.status(401).json({
      user: null,
    });
  }

  return res.json({
    user: {
      ...user,
      isAdmin: getIsAdmin(user.email),
    },
  });
});