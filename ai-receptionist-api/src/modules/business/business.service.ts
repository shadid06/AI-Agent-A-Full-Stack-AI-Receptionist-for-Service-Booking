import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { assertFound } from "../../lib/errors.js";
import type {
  CreateBusinessInput,
  UpdateBusinessInput,
  ListBusinessQuery
} from "./business.schemas.js";

export async function createBusiness(input: CreateBusinessInput) {
  return prisma.business.create({
    data: {
      name: input.name,
      industry: input.industry,
      description: input.description,
      timezone: input.timezone,
      phone: input.phone,
      email: input.email,
      address: input.address
    },
    include: {
      services: { where: { isActive: true } },
      staff: { where: { isActive: true }, include: { availability: true } }
    }
  });
}

export async function getBusiness(businessId: string) {
  return assertFound(
    await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { name: "asc" }
        },
        staff: {
          where: { isActive: true },
          include: { availability: true }
        }
      }
    }),
    "Business not found"
  );
}

export async function listBusinesses(query?: ListBusinessQuery) {
  const where: Prisma.BusinessWhereInput = {};

  if (query?.industry) {
    where.industry = query.industry;
  }

  if (query?.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query?.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { email: { contains: query.q, mode: "insensitive" } },
      { phone: { contains: query.q, mode: "insensitive" } }
    ];
  }

  return prisma.business.findMany({
    where,
    include: {
      services: { where: { isActive: true } },
      staff: { where: { isActive: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function updateBusiness(
  businessId: string,
  input: UpdateBusinessInput
) {
  await getBusiness(businessId);

  return prisma.business.update({
    where: { id: businessId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.industry !== undefined ? { industry: input.industry } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
    },
    include: {
      services: { where: { isActive: true } },
      staff: { where: { isActive: true }, include: { availability: true } }
    }
  });
}

export async function deleteBusiness(businessId: string) {
  await getBusiness(businessId);

  return prisma.business.update({
    where: { id: businessId },
    data: { isActive: false }
  });
}
