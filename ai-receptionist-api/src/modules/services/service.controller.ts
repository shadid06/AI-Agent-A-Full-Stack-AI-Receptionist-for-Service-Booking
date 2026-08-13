import type { Request, Response } from "express";
import {
  createServiceSchema,
  updateServiceSchema,
  listServiceSchema
} from "./service.schemas.js";
import * as serviceService from "./service.service.js";
import { resolveBusinessContext } from "../../lib/tenant.js";
import { AppError } from "../../lib/errors.js";

export async function list(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const query = listServiceSchema.parse(req.query);
  const result = await serviceService.listServices(businessId, query);
  res.json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const result = await serviceService.getService(
    req.params.serviceId as string,
    businessId
  );
  res.json({ success: true, data: result });
}

export async function create(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const input = createServiceSchema.parse(req.body);
  const result = await serviceService.createService(businessId, input);
  res.status(201).json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const input = updateServiceSchema.parse(req.body);
  const result = await serviceService.updateService(
    req.params.serviceId as string,
    input,
    businessId
  );
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  const { businessId } = await resolveBusinessContext(req, {
    allowHeaderFallback: true
  });
  const result = await serviceService.deleteService(
    req.params.serviceId as string,
    businessId
  );
  res.json({ success: true, data: result });
}
