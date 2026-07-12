import jwt, { SignOptions } from "jsonwebtoken";
import type { UserRole } from "../generated/prisma/client";
import { env } from "../config/env";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

type TokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
