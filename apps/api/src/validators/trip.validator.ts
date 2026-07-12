import { z } from "zod";

export const createTripSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  cargoWeightKg: z.number().positive(),
  plannedDistanceKm: z.number().positive(),
  revenue: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const completeTripSchema = z.object({
  actualDistanceKm: z.number().positive(),
  fuelConsumedLiters: z.number().positive(),
  revenue: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const cancelTripSchema = z.object({
  notes: z.string().optional(),
});
