import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  durationMin: z.number().int().min(1).max(1440).default(30),
  price: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d{1,2})?$/)]).optional(),
  isActive: z.boolean().optional()
});

export const updateServiceSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(1000).nullable().optional(),
  durationMin: z.number().int().min(1).max(1440).optional(),
  price: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d{1,2})?$/)]).nullable().optional(),
  isActive: z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required"
});

export const listServiceSchema = z.object({
  q: z.string().optional(),
  isActive: z.enum(["true", "false"]).transform((v) => v === "true").optional()
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ListServiceQuery = z.infer<typeof listServiceSchema>;
