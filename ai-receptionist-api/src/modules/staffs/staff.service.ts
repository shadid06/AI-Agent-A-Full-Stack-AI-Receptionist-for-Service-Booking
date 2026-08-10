import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { assertFound } from "../../lib/errors.js";
import type {
  CreateStaffInput,
  UpdateStaffInput,
  ListStaffQuery
} from "./staff.schemas.js";

export async function listStaff(businessId?: string, query?: ListStaffQuery) {
  const where: Prisma.StaffWhereInput = {};

  if (businessId) {
    where.businessId = businessId;
  }

  if (query?.role) {
    where.role = query.role;
  }

  if (query?.isActive !== undefined) {
    where.isActive = query.isActive;
  } else if (!query?.isActive) {
    where.isActive = true;
  }

  return prisma.staff.findMany({
    where,
    include: { availability: true },
    orderBy: { name: "asc" }
  });
}

export async function getStaff(staffId: string, businessId?: string) {
  return assertFound(
    await prisma.staff.findFirst({
      where: {
        id: staffId,
        ...(businessId ? { businessId } : {})
      },
      include: { availability: true }
    }),
    "Staff member not found"
  );
}

export async function createStaff(
  businessId: string,
  input: CreateStaffInput
) {
  return prisma.staff.create({
    data: {
      businessId,
      name: input.name,
      role: input.role,
      email: input.email,
      phone: input.phone,
      isActive: input.isActive ?? true,
      ...(input.availability && input.availability.length > 0
        ? {
            availability: {
              create: input.availability.map((a) => ({
                dayOfWeek: a.dayOfWeek,
                startTime: a.startTime,
                endTime: a.endTime,
                isActive: a.isActive ?? true
              }))
            }
          }
        : {})
    },
    include: { availability: true }
  });
}

export async function updateStaff(
  staffId: string,
  input: UpdateStaffInput,
  businessId?: string
) {
  const staff = await getStaff(staffId, businessId);

  if (input.availability !== undefined) {
    await prisma.staffAvailability.deleteMany({
      where: { staffId: staff.id }
    });
    if (input.availability.length > 0) {
      await prisma.staffAvailability.createMany({
        data: input.availability.map((a) => ({
          staffId: staff.id,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          isActive: a.isActive ?? true
        }))
      });
    }
  }

  return prisma.staff.update({
    where: { id: staff.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
    },
    include: { availability: true }
  });
}

export async function deleteStaff(staffId: string, businessId?: string) {
  const staff = await getStaff(staffId, businessId);

  return prisma.staff.update({
    where: { id: staff.id },
    data: { isActive: false },
    include: { availability: true }
  });
}
