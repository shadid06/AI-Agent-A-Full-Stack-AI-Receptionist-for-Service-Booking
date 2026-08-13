import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as authService from "./auth.service.js";
import { AppError } from "../../lib/errors.js";

export async function me(req: Request, res: Response) {
  const auth = getAuth(req);

  if (!auth.isAuthenticated || !auth.userId) {
    throw new AppError(401, "Unauthorized");
  }

  const user = await authService.getOrSyncCurrentUser(auth.userId);
  const businesses = await authService.listAccessibleBusinesses(user.id);

  res.json({
    success: true,
    data: {
      auth: {
        userId: auth.userId,
        orgId: auth.orgId ?? null,
        orgSlug: auth.orgSlug ?? null,
        orgRole: auth.orgRole ?? null
      },
      user,
      businesses
    }
  });
}
