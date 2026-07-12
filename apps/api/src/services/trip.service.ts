import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";

function generateTripCode() {
  return `TRIP-${Date.now()}`;
}

export async function listTrips() {
  return prisma.trip.findMany({
    include: {
      vehicle: true,
      driver: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTrip(input: {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  revenue?: number;
  notes?: string;
  createdById: string;
}) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: input.vehicleId },
  });

  if (!vehicle) {
    throw new HttpError(404, "Vehicle not found");
  }

  const driver = await prisma.driver.findUnique({
    where: { id: input.driverId },
  });

  if (!driver) {
    throw new HttpError(404, "Driver not found");
  }

  if (input.cargoWeightKg > vehicle.maxLoadCapacityKg) {
    throw new HttpError(
      400,
      "Cargo weight exceeds vehicle maximum load capacity",
    );
  }

  return prisma.trip.create({
    data: {
      tripCode: generateTripCode(),
      source: input.source,
      destination: input.destination,
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      cargoWeightKg: input.cargoWeightKg,
      plannedDistanceKm: input.plannedDistanceKm,
      revenue: input.revenue,
      notes: input.notes,
      createdById: input.createdById,
      status: "DRAFT",
    },
    include: {
      vehicle: true,
      driver: true,
    },
  });
}

export async function dispatchTrip(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      vehicle: true,
      driver: true,
    },
  });

  if (!trip) {
    throw new HttpError(404, "Trip not found");
  }

  if (trip.status !== "DRAFT") {
    throw new HttpError(400, "Only draft trips can be dispatched");
  }

  if (trip.vehicle.status === "RETIRED" || trip.vehicle.status === "IN_SHOP") {
    throw new HttpError(400, "Vehicle is not available for dispatch");
  }

  if (trip.vehicle.status === "ON_TRIP") {
    throw new HttpError(400, "Vehicle is already on a trip");
  }

  if (trip.driver.status === "SUSPENDED") {
    throw new HttpError(400, "Driver is suspended");
  }

  if (trip.driver.status === "ON_TRIP") {
    throw new HttpError(400, "Driver is already on a trip");
  }

  if (trip.driver.licenseExpiryDate < new Date()) {
    throw new HttpError(400, "Driver license is expired");
  }

  if (trip.cargoWeightKg > trip.vehicle.maxLoadCapacityKg) {
    throw new HttpError(
      400,
      "Cargo weight exceeds vehicle maximum load capacity",
    );
  }

  return prisma.$transaction(async (tx) => {
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: "DISPATCHED",
        dispatchedAt: new Date(),
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "ON_TRIP" },
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: "ON_TRIP" },
    });

    return updatedTrip;
  });
}

export async function completeTrip(
  tripId: string,
  input: {
    actualDistanceKm: number;
    fuelConsumedLiters: number;
    revenue?: number;
    notes?: string;
  },
) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });

  if (!trip) {
    throw new HttpError(404, "Trip not found");
  }

  if (trip.status !== "DISPATCHED") {
    throw new HttpError(400, "Only dispatched trips can be completed");
  }

  return prisma.$transaction(async (tx) => {
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: "COMPLETED",
        actualDistanceKm: input.actualDistanceKm,
        fuelConsumedLiters: input.fuelConsumedLiters,
        revenue: input.revenue ?? trip.revenue,
        notes: input.notes ?? trip.notes,
        completedAt: new Date(),
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "AVAILABLE" },
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: "AVAILABLE" },
    });

    return updatedTrip;
  });
}

export async function cancelTrip(tripId: string, input: { notes?: string }) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });

  if (!trip) {
    throw new HttpError(404, "Trip not found");
  }

  if (trip.status === "COMPLETED" || trip.status === "CANCELLED") {
    throw new HttpError(400, "Trip cannot be cancelled");
  }

  return prisma.$transaction(async (tx) => {
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        notes: input.notes ?? trip.notes,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    if (trip.status === "DISPATCHED") {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "AVAILABLE" },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      });
    }

    return updatedTrip;
  });
}
