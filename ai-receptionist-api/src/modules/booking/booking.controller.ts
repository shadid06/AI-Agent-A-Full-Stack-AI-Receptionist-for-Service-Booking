import type { Request, Response } from "express";
import { BookingStatus } from "@prisma/client";
import {
  availabilitySchema,
  createBookingSchema,
  listBookingSchema,
  updateBookingSchema
} from "./booking.schemas.js";
import * as bookingService from "./booking.service.js";
import { resolveBusinessContext } from "../../lib/tenant.js";

export async function searchServices(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });

  const services = await bookingService.searchServices(
    businessId,
    typeof req.query.q === "string" ? req.query.q : undefined
  );
  res.json({ success: true, data: services });
}

export async function availability(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const input = availabilitySchema.parse(req.query);
  const result = await bookingService.getAvailability(businessId, input);
  res.json({ success: true, data: result });
}

export async function create(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const input = createBookingSchema.parse(req.body);
  const result = await bookingService.createBooking(businessId, input);
  res.status(201).json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const result = await bookingService.getBooking(
    businessId,
    req.params.bookingId as string
  );
  res.json({ success: true, data: result });
}

export async function list(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const query = listBookingSchema.parse(req.query);
  const result = await bookingService.listBookings(
    businessId,
    query.date,
    query.status as BookingStatus | undefined
  );
  res.json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const input = updateBookingSchema.parse(req.body);
  const result = await bookingService.updateBooking(
    businessId,
    req.params.bookingId as string,
    input
  );
  res.json({ success: true, data: result });
}

export async function cancel(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const result = await bookingService.cancelBooking(
    businessId,
    req.params.bookingId as string
  );
  res.json({ success: true, data: result });
}
