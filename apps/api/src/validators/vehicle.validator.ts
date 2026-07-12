import { z } from "zod";

export const createVehicleSchema = z.object({
  registrationNo: z.string().min(1),
  name: z.string().min(1),
  model: z.string().optional(),
  type: z.string().min(1),
  maxLoadCapacityKg: z.number().positive(),
  odometerKm: z.number().min(0).default(0),
  acquisitionCost: z.number().nonnegative(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).optional(),
  isActive: z.boolean().optional(),
});

export const updateVehicleSchema = z.object({
  registrationNo: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  model: z.string().optional(),
  type: z.string().min(1).optional(),
  maxLoadCapacityKg: z.number().positive().optional(),
  odometerKm: z.number().min(0).optional(),
  acquisitionCost: z.number().nonnegative().optional(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).optional(),
  isActive: z.boolean().optional(),
});
