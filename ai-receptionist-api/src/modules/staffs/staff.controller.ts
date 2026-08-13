import type { Request, Response } from "express";
import {
  createStaffSchema,
  updateStaffSchema,
  listStaffSchema
} from "./staff.schemas.js";
import * as staffService from "./staff.service.js";
import { resolveBusinessContext } from "../../lib/tenant.js";

export async function list(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const query = listStaffSchema.parse(req.query);
  const result = await staffService.listStaff(businessId, query);
  res.json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const result = await staffService.getStaff(
    req.params.staffId as string,
    businessId
  );
  res.json({ success: true, data: result });
}

export async function create(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const input = createStaffSchema.parse(req.body);
  const result = await staffService.createStaff(businessId, input);
  res.status(201).json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const input = updateStaffSchema.parse(req.body);
  const result = await staffService.updateStaff(
    req.params.staffId as string,
    input,
    businessId
  );
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const result = await staffService.deleteStaff(
    req.params.staffId as string,
    businessId
  );
  res.json({ success: true, data: result });
}
