import type { Request, Response } from "express";
import {
  createStaffSchema,
  updateStaffSchema,
  listStaffSchema
} from "./staff.schemas.js";
import * as staffService from "./staff.service.js";
import { AppError } from "../../lib/errors.js";

function getBusinessIdHeader(req: Request): string | undefined {
  const id = req.header("x-business-id");
  return id || undefined;
}

export async function list(req: Request, res: Response) {
  const query = listStaffSchema.parse(req.query);
  const businessId =
    getBusinessIdHeader(req) ||
    (typeof req.query.businessId === "string" ? req.query.businessId : undefined);

  const result = await staffService.listStaff(businessId, query);
  res.json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const businessId = getBusinessIdHeader(req);
  const result = await staffService.getStaff(
    req.params.staffId as string,
    businessId
  );
  res.json({ success: true, data: result });
}

export async function create(req: Request, res: Response) {
  const businessId =
    getBusinessIdHeader(req) ||
    (typeof req.body.businessId === "string" ? req.body.businessId : undefined);

  if (!businessId) {
    throw new AppError(400, "Missing businessId in header (x-business-id) or body");
  }

  const input = createStaffSchema.parse(req.body);
  const result = await staffService.createStaff(businessId, input);
  res.status(201).json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const businessId = getBusinessIdHeader(req);
  const input = updateStaffSchema.parse(req.body);
  const result = await staffService.updateStaff(
    req.params.staffId as string,
    input,
    businessId
  );
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  const businessId = getBusinessIdHeader(req);
  const result = await staffService.deleteStaff(
    req.params.staffId as string,
    businessId
  );
  res.json({ success: true, data: result });
}
