import { z } from "zod";

export const createFuelLogSchema = z.object({
  vehicleId: z.string().min(1),
  tripId: z.string().min(1).optional(),
  liters: z.number().positive(),
  cost: z.number().nonnegative(),
  odometerKm: z.number().min(0).optional(),
  loggedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});
