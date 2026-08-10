import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { assertFound } from "../../lib/errors.js";
import type {
  CreateServiceInput,
  UpdateServiceInput,
  ListServiceQuery
} from "./service.schemas.js";

export async function listServices(businessId?: string, query?: ListServiceQuery) {
  const where: Prisma.ServiceWhereInput = {};

  if (businessId) {
    where.businessId = businessId;
  }

  if (query?.isActive !== undefined) {
    where.isActive = query.isActive;
  } else if (!query?.isActive) {
    where.isActive = true;
  }

  if (query?.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } }
    ];
  }

  return prisma.service.findMany({
    where,
    orderBy: { name: "asc" }
  });
}

export async function getService(serviceId: string, businessId?: string) {
  return assertFound(
    await prisma.service.findFirst({
      where: {
        id: serviceId,
        ...(businessId ? { businessId } : {})
      }
    }),
    "Service not found"
  );
}

export async function createService(
  businessId: string,
  input: CreateServiceInput
) {
  return prisma.service.create({
    data: {
      businessId,
      name: input.name,
      description: input.description,
      durationMin: input.durationMin,
      price: input.price !== undefined ? input.price.toString() : null,
      isActive: input.isActive ?? true
    }
  });
}

export async function updateService(
  serviceId: string,
  input: UpdateServiceInput,
  businessId?: string
) {
  const service = await getService(serviceId, businessId);

  return prisma.service.update({
    where: { id: service.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.durationMin !== undefined ? { durationMin: input.durationMin } : {}),
      ...(input.price !== undefined
        ? { price: input.price !== null ? input.price.toString() : null }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
    }
  });
}

export async function deleteService(serviceId: string, businessId?: string) {
  const service = await getService(serviceId, businessId);

  return prisma.service.update({
    where: { id: service.id },
    data: { isActive: false }
  });
}
