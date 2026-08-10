import type { Request, Response } from "express";
import {
  createBusinessSchema,
  updateBusinessSchema,
  listBusinessSchema
} from "./business.schemas.js";
import * as businessService from "./business.service.js";

export async function create(req: Request, res: Response) {
  const input = createBusinessSchema.parse(req.body);
  const result = await businessService.createBusiness(input);
  res.status(201).json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const result = await businessService.getBusiness(req.params.businessId as string);
  res.json({ success: true, data: result });
}

export async function list(req: Request, res: Response) {
  const query = listBusinessSchema.parse(req.query);
  const result = await businessService.listBusinesses(query);
  res.json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const input = updateBusinessSchema.parse(req.body);
  const result = await businessService.updateBusiness(
    req.params.businessId as string,
    input
  );
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  const result = await businessService.deleteBusiness(req.params.businessId as string);
  res.json({ success: true, data: result });
}
