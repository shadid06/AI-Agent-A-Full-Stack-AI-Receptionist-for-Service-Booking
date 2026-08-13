import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { AppError } from "../lib/errors.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = getAuth(req);

  if (!auth.isAuthenticated || !auth.userId) {
    next(new AppError(401, "Unauthorized"));
    return;
  }

  next();
}

export function requireOrganization(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const auth = getAuth(req);

  if (!auth.isAuthenticated || !auth.userId) {
    next(new AppError(401, "Unauthorized"));
    return;
  }

  if (!auth.orgId) {
    next(new AppError(400, "An active organization is required"));
    return;
  }

  next();
}
