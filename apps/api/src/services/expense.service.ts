import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";

export async function listExpenses() {
  return prisma.expense.findMany({
    include: {
      vehicle: true,
      trip: true,
    },
    orderBy: { expenseDate: "desc" },
  });
}

export async function createExpense(input: {
  vehicleId: string;
  tripId?: string;
  type: "FUEL" | "MAINTENANCE" | "TOLL" | "REPAIR" | "OTHER";
  amount: number;
  description?: string;
  expenseDate: string;
}) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: input.vehicleId },
  });

  if (!vehicle) {
    throw new HttpError(404, "Vehicle not found");
  }

  if (input.tripId) {
    const trip = await prisma.trip.findUnique({
      where: { id: input.tripId },
    });

    if (!trip) {
      throw new HttpError(404, "Trip not found");
    }
  }

  return prisma.expense.create({
    data: {
      vehicleId: input.vehicleId,
      tripId: input.tripId,
      type: input.type,
      amount: input.amount,
      description: input.description,
      expenseDate: new Date(input.expenseDate),
    },
    include: {
      vehicle: true,
      trip: true,
    },
  });
}
