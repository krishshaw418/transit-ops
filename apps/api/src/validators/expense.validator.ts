import { z } from "zod";

export const createExpenseSchema = z.object({
  vehicleId: z.string().min(1),
  tripId: z.string().min(1).optional(),
  type: z.enum(["FUEL", "MAINTENANCE", "TOLL", "REPAIR", "OTHER"]),
  amount: z.number().nonnegative(),
  description: z.string().optional(),
  expenseDate: z.string().datetime(),
});
