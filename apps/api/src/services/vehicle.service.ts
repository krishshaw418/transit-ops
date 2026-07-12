import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";

export async function listVehicles() {
  return prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createVehicle(input: {
  registrationNo: string;
  name: string;
  model?: string;
  type: string;
  maxLoadCapacityKg: number;
  odometerKm?: number;
  acquisitionCost: number;
  status?: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
  isActive?: boolean;
}) {
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { registrationNo: input.registrationNo },
  });

  if (existingVehicle) {
    throw new HttpError(409, "Vehicle registration number already exists");
  }

  return prisma.vehicle.create({
    data: {
      registrationNo: input.registrationNo,
      name: input.name,
      model: input.model,
      type: input.type,
      maxLoadCapacityKg: input.maxLoadCapacityKg,
      odometerKm: input.odometerKm ?? 0,
      acquisitionCost: input.acquisitionCost,
      status: input.status ?? "AVAILABLE",
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateVehicle(
  vehicleId: string,
  input: {
    registrationNo?: string;
    name?: string;
    model?: string;
    type?: string;
    maxLoadCapacityKg?: number;
    odometerKm?: number;
    acquisitionCost?: number;
    status?: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
    isActive?: boolean;
  },
) {
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!existingVehicle) {
    throw new HttpError(404, "Vehicle not found");
  }

  if (
    input.registrationNo &&
    input.registrationNo !== existingVehicle.registrationNo
  ) {
    const duplicateVehicle = await prisma.vehicle.findUnique({
      where: { registrationNo: input.registrationNo },
    });

    if (duplicateVehicle) {
      throw new HttpError(409, "Vehicle registration number already exists");
    }
  }

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: input,
  });
}
