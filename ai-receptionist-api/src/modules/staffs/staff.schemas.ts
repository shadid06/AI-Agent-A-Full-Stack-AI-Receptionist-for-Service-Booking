import { z } from "zod";
import { StaffRole } from "@prisma/client";

export const staffAvailabilityInputSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  isActive: z.boolean().optional()
});

export const createStaffSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.nativeEnum(StaffRole).default(StaffRole.GENERAL),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  isActive: z.boolean().optional(),
  availability: z.array(staffAvailabilityInputSchema).optional()
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.nativeEnum(StaffRole).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  isActive: z.boolean().optional(),
  availability: z.array(staffAvailabilityInputSchema).optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required"
});

export const listStaffSchema = z.object({
  role: z.nativeEnum(StaffRole).optional(),
  isActive: z.enum(["true", "false"]).transform((v) => v === "true").optional()
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type ListStaffQuery = z.infer<typeof listStaffSchema>;
