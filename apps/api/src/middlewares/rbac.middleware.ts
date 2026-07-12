import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../generated/prisma/client";
import { HttpError } from "../lib/http-error";

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new HttpError(403, "Forbidden"));
    }

    next();
  };
}
