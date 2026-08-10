import type { Request, Response } from "express";
import { BookingStatus } from "@prisma/client";
import {
  availabilitySchema,
  createBookingSchema,
  listBookingSchema,
  updateBookingSchema
} from "./booking.schemas.js";
import * as bookingService from "./booking.service.js";
import { AppError } from "../../lib/errors.js";

function businessId(req: Request): string {
  const id = req.header("x-business-id");
  if (!id) throw new AppError(400, "Missing x-business-id header");
  return id;
}

export async function searchServices(req: Request, res: Response) {
  const services = await bookingService.searchServices(
    businessId(req),
    typeof req.query.q === "string" ? req.query.q : undefined
  );
  res.json({ success: true, data: services });
}

export async function availability(req: Request, res: Response) {
  const input = availabilitySchema.parse(req.query);
  const result = await bookingService.getAvailability(businessId(req), input);
  res.json({ success: true, data: result });
}

export async function create(req: Request, res: Response) {
  const input = createBookingSchema.parse(req.body);
  const result = await bookingService.createBooking(businessId(req), input);
  res.status(201).json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const result = await bookingService.getBooking(
    businessId(req),
    req.params.bookingId as string
  );
  res.json({ success: true, data: result });
}

export async function list(req: Request, res: Response) {
  const query = listBookingSchema.parse(req.query);
  const result = await bookingService.listBookings(
    businessId(req),
    query.date,
    query.status as BookingStatus | undefined
  );
  res.json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const input = updateBookingSchema.parse(req.body);
  const result = await bookingService.updateBooking(
    businessId(req),
    req.params.bookingId as string,
    input
  );
  res.json({ success: true, data: result });
}

export async function cancel(req: Request, res: Response) {
  const result = await bookingService.cancelBooking(
    businessId(req),
    req.params.bookingId as string
  );
  res.json({ success: true, data: result });
}
