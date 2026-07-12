import { z } from "zod";

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const startMaintenanceSchema = z.object({
  notes: z.string().optional(),
});

export const completeMaintenanceSchema = z.object({
  cost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});