import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/auth";
import { HttpError } from "../lib/http-error";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Missing or invalid authorization header"));
  }

  const token = authHeader.slice(7);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}
