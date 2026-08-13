import { getAuth } from "@clerk/express";
import type { Request } from "express";
import { env } from "../config/env.js";
import { AppError, assertFound } from "./errors.js";
import { prisma } from "./prisma.js";
import { getOrSyncCurrentUser } from "../modules/auth/auth.service.js";

type ResolveBusinessOptions = {
  allowHeaderFallback?: boolean;
  requireAuth?: boolean;
};

type BusinessContext = {
  businessId: string;
  authUserId: string | null;
};

function readBusinessId(req: Request) {
  const headerBusinessId = req.header("x-business-id");

  if (headerBusinessId) {
    return headerBusinessId;
  }

  if (typeof req.query.businessId === "string" && req.query.businessId) {
    return req.query.businessId;
  }

  if (typeof req.body?.businessId === "string" && req.body.businessId) {
    return req.body.businessId;
  }

  if (env.DEFAULT_BUSINESS_ID) {
    return env.DEFAULT_BUSINESS_ID;
  }

  return null;
}

export async function resolveBusinessContext(
  req: Request,
  options: ResolveBusinessOptions = {}
): Promise<BusinessContext> {
  const auth = getAuth(req);
  const isAuthenticated = Boolean(auth.isAuthenticated && auth.userId);
  const authUserId = isAuthenticated ? auth.userId : null;
  const headerBusinessId = readBusinessId(req);

  if (options.requireAuth && !isAuthenticated) {
    throw new AppError(401, "Unauthorized");
  }

  if (auth.orgId) {
    const business = await prisma.business.findFirst({
      where: {
        clerkOrganizationId: auth.orgId,
        isActive: true
      }
    });

    if (!business) {
      throw new AppError(
        404,
        "No business workspace is linked to the active organization"
      );
    }

    if (headerBusinessId && headerBusinessId !== business.id) {
      throw new AppError(403, "Business context does not match active organization");
    }

    return {
      businessId: business.id,
      authUserId
    };
  }

  if (!headerBusinessId) {
    throw new AppError(400, "Missing business context");
  }

  const business = assertFound(
    await prisma.business.findFirst({
      where: {
        id: headerBusinessId,
        isActive: true
      }
    }),
    "Business not found"
  );

  if (isAuthenticated && authUserId) {
    const currentUser = await getOrSyncCurrentUser(authUserId);
    const membership = await prisma.membership.findFirst({
      where: {
        businessId: business.id,
        userId: currentUser.id
      }
    });

    if (!membership && business.ownerUserId !== currentUser.id) {
      throw new AppError(403, "You do not have access to this business");
    }
  } else if (!options.allowHeaderFallback) {
    throw new AppError(401, "Unauthorized");
  }

  return {
    businessId: business.id,
    authUserId
  };
}
