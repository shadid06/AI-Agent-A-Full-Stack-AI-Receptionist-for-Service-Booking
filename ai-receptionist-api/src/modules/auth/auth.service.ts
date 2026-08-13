import { clerkClient } from "@clerk/express";
import { MembershipRole, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { assertFound } from "../../lib/errors.js";
import { slugify } from "../../utils/slugs.js";
import type { CreateBusinessInput } from "../business/business.schemas.js";

type ClerkUser = Awaited<ReturnType<typeof clerkClient.users.getUser>>;

function getDisplayName(user: ClerkUser) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.username || user.emailAddresses[0]?.emailAddress || "User";
}

export async function syncCurrentUser(clerkUserId: string) {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;

  return prisma.user.upsert({
    where: { clerkUserId },
    update: {
      email,
      name: getDisplayName(clerkUser),
      imageUrl: clerkUser.imageUrl
    },
    create: {
      clerkUserId,
      email,
      name: getDisplayName(clerkUser),
      imageUrl: clerkUser.imageUrl
    }
  });
}

export async function getOrSyncCurrentUser(clerkUserId: string) {
  return syncCurrentUser(clerkUserId);
}

export async function listAccessibleBusinesses(userId: string) {
  return prisma.business.findMany({
    where: {
      isActive: true,
      OR: [
        { ownerUserId: userId },
        { memberships: { some: { userId } } }
      ]
    },
    include: {
      memberships: {
        include: {
          user: true
        }
      },
      services: {
        where: { isActive: true }
      },
      staff: {
        where: { isActive: true },
        include: { availability: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function assertUserBusinessAccess(userId: string, businessId: string) {
  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      isActive: true,
      OR: [
        { ownerUserId: userId },
        { memberships: { some: { userId } } }
      ]
    },
    include: {
      memberships: {
        include: { user: true }
      },
      services: { where: { isActive: true } },
      staff: { where: { isActive: true }, include: { availability: true } }
    }
  });

  return assertFound(business, "Business not found or access denied");
}

export async function createBusinessForUser(
  userId: string,
  input: CreateBusinessInput
) {
  const slug = input.slug || slugify(input.name);

  const business = await prisma.business.create({
    data: {
      name: input.name,
      slug,
      industry: input.industry,
      description: input.description,
      timezone: input.timezone,
      phone: input.phone,
      email: input.email,
      address: input.address,
      clerkOrganizationId: input.clerkOrganizationId,
      ownerUserId: userId,
      memberships: {
        create: {
          userId,
          role: MembershipRole.OWNER
        }
      }
    },
    include: {
      memberships: { include: { user: true } },
      services: { where: { isActive: true } },
      staff: { where: { isActive: true }, include: { availability: true } }
    }
  });

  return business;
}

export async function linkBusinessToOrganization(
  businessId: string,
  clerkOrganizationId: string
) {
  return prisma.business.update({
    where: { id: businessId },
    data: { clerkOrganizationId }
  });
}

export async function ensureMembership(
  userId: string,
  businessId: string,
  role: MembershipRole = MembershipRole.VIEWER
) {
  return prisma.membership.upsert({
    where: {
      businessId_userId: {
        businessId,
        userId
      }
    },
    update: { role },
    create: {
      businessId,
      userId,
      role
    },
    include: {
      business: true,
      user: true
    }
  });
}
