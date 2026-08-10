import { z } from "zod";

export const availabilitySchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  staffId: z.string().optional()
});

export const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().optional(),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(5).max(30),
  customerEmail: z.string().email().optional(),
  startAt: z.string().datetime(),
  notes: z.string().max(1000).optional()
});

export const updateBookingSchema = z.object({
  startAt: z.string().datetime().optional(),
  staffId: z.string().nullable().optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]).optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required"
});

export const listBookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]).optional()
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
