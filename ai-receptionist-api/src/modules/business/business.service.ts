import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { assertFound } from "../../lib/errors.js";
import { slugify } from "../../utils/slugs.js";
import * as authService from "../auth/auth.service.js";
import type {
  CreateBusinessInput,
  UpdateBusinessInput,
  ListBusinessQuery
} from "./business.schemas.js";

export async function createBusiness(userId: string, input: CreateBusinessInput) {
  return authService.createBusinessForUser(userId, input);
}

export async function getBusiness(businessId: string, userId: string) {
  return authService.assertUserBusinessAccess(userId, businessId);
}

export async function listBusinesses(userId: string, query?: ListBusinessQuery) {
  const where: Prisma.BusinessWhereInput = {
    OR: [{ ownerUserId: userId }, { memberships: { some: { userId } } }]
  };

  if (query?.industry) {
    where.industry = query.industry;
  }

  if (query?.isActive !== undefined) {
    where.isActive = query.isActive;
  } else {
    where.isActive = true;
  }

  if (query?.q) {
    return prisma.business.findMany({
      where: {
        AND: [
          where,
          {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { description: { contains: query.q, mode: "insensitive" } },
              { email: { contains: query.q, mode: "insensitive" } },
              { phone: { contains: query.q, mode: "insensitive" } }
            ]
          }
        ]
      },
      include: {
        memberships: {
          include: { user: true }
        },
        services: { where: { isActive: true } },
        staff: { where: { isActive: true }, include: { availability: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  return prisma.business.findMany({
    where,
    include: {
      memberships: {
        include: { user: true }
      },
      services: { where: { isActive: true } },
      staff: { where: { isActive: true }, include: { availability: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function updateBusiness(
  businessId: string,
  userId: string,
  input: UpdateBusinessInput
) {
  await authService.assertUserBusinessAccess(userId, businessId);

  const current = assertFound(
    await prisma.business.findUnique({
      where: { id: businessId }
    }),
    "Business not found"
  );

  return prisma.business.update({
    where: { id: businessId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined
        ? { slug: input.slug || slugify(input.name ?? current.name) }
        : {}),
      ...(input.industry !== undefined ? { industry: input.industry } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.clerkOrganizationId !== undefined
        ? { clerkOrganizationId: input.clerkOrganizationId }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
    },
    include: {
      memberships: {
        include: { user: true }
      },
      services: { where: { isActive: true } },
      staff: { where: { isActive: true }, include: { availability: true } }
    }
  });
}

export async function deleteBusiness(businessId: string, userId: string) {
  await authService.assertUserBusinessAccess(userId, businessId);

  return prisma.business.update({
    where: { id: businessId },
    data: { isActive: false }
  });
}
