import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";

export async function listFuelLogs() {
  return prisma.fuelLog.findMany({
    include: {
      vehicle: true,
      trip: true,
    },
    orderBy: { loggedAt: "desc" },
  });
}

export async function createFuelLog(input: {
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  odometerKm?: number;
  loggedAt?: string;
  notes?: string;
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

  return prisma.fuelLog.create({
    data: {
      vehicleId: input.vehicleId,
      tripId: input.tripId,
      liters: input.liters,
      cost: input.cost,
      odometerKm: input.odometerKm,
      loggedAt: input.loggedAt ? new Date(input.loggedAt) : undefined,
      notes: input.notes,
    },
    include: {
      vehicle: true,
      trip: true,
    },
  });
}
