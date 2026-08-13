import { z } from "zod";
import { Industry } from "@prisma/client";

export const createBusinessSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).optional(),
  industry: z.nativeEnum(Industry),
  description: z.string().max(1000).optional(),
  timezone: z.string().default("Asia/Dhaka"),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  clerkOrganizationId: z.string().optional()
});

export const updateBusinessSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  slug: z.string().min(2).max(120).optional(),
  industry: z.nativeEnum(Industry).optional(),
  description: z.string().max(1000).nullable().optional(),
  timezone: z.string().optional(),
  phone: z.string().max(30).nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  clerkOrganizationId: z.string().nullable().optional(),
  isActive: z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required"
});

export const listBusinessSchema = z.object({
  industry: z.nativeEnum(Industry).optional(),
  isActive: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  q: z.string().optional()
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type ListBusinessQuery = z.infer<typeof listBusinessSchema>;
