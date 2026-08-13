import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  createBusinessSchema,
  updateBusinessSchema,
  listBusinessSchema
} from "./business.schemas.js";
import * as businessService from "./business.service.js";
import * as authService from "../auth/auth.service.js";
import { AppError } from "../../lib/errors.js";

function requireUserId(req: Request) {
  const auth = getAuth(req);

  if (!auth.isAuthenticated || !auth.userId) {
    throw new AppError(401, "Unauthorized");
  }

  return auth.userId;
}

export async function create(req: Request, res: Response) {
  const userId = requireUserId(req);
  const currentUser = await authService.getOrSyncCurrentUser(userId);
  const input = createBusinessSchema.parse(req.body);
  const result = await businessService.createBusiness(currentUser.id, input);
  res.status(201).json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const userId = requireUserId(req);
  const result = await businessService.getBusiness(
    req.params.businessId as string,
    userId
  );
  res.json({ success: true, data: result });
}

export async function list(req: Request, res: Response) {
  const userId = requireUserId(req);
  const currentUser = await authService.getOrSyncCurrentUser(userId);
  const query = listBusinessSchema.parse(req.query);
  const result = await businessService.listBusinesses(currentUser.id, query);
  res.json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const userId = requireUserId(req);
  const currentUser = await authService.getOrSyncCurrentUser(userId);
  const input = updateBusinessSchema.parse(req.body);
  const result = await businessService.updateBusiness(
    req.params.businessId as string,
    currentUser.id,
    input
  );
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  const userId = requireUserId(req);
  const currentUser = await authService.getOrSyncCurrentUser(userId);
  const result = await businessService.deleteBusiness(
    req.params.businessId as string,
    currentUser.id
  );
  res.json({ success: true, data: result });
}
