import type { Request, Response } from "express";
import {
  createServiceSchema,
  updateServiceSchema,
  listServiceSchema
} from "./service.schemas.js";
import * as serviceService from "./service.service.js";
import { AppError } from "../../lib/errors.js";

function getBusinessIdHeader(req: Request): string | undefined {
  const id = req.header("x-business-id");
  return id || undefined;
}

export async function list(req: Request, res: Response) {
  const query = listServiceSchema.parse(req.query);
  const businessId =
    getBusinessIdHeader(req) ||
    (typeof req.query.businessId === "string" ? req.query.businessId : undefined);

  const result = await serviceService.listServices(businessId, query);
  res.json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const businessId = getBusinessIdHeader(req);
  const result = await serviceService.getService(
    req.params.serviceId as string,
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

  const input = createServiceSchema.parse(req.body);
  const result = await serviceService.createService(businessId, input);
  res.status(201).json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const businessId = getBusinessIdHeader(req);
  const input = updateServiceSchema.parse(req.body);
  const result = await serviceService.updateService(
    req.params.serviceId as string,
    input,
    businessId
  );
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  const businessId = getBusinessIdHeader(req);
  const result = await serviceService.deleteService(
    req.params.serviceId as string,
    businessId
  );
  res.json({ success: true, data: result });
}
