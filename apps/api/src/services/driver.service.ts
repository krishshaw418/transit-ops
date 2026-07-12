import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";

export async function listDrivers() {
  return prisma.driver.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createDriver(input: {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore?: number;
  status?: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
}) {
  const existingDriver = await prisma.driver.findUnique({
    where: { licenseNumber: input.licenseNumber },
  });

  if (existingDriver) {
    throw new HttpError(409, "Driver license number already exists");
  }

  return prisma.driver.create({
    data: {
      name: input.name,
      licenseNumber: input.licenseNumber,
      licenseCategory: input.licenseCategory,
      licenseExpiryDate: new Date(input.licenseExpiryDate),
      contactNumber: input.contactNumber,
      safetyScore: input.safetyScore ?? 100,
      status: input.status ?? "AVAILABLE",
    },
  });
}

export async function updateDriver(
  driverId: string,
  input: {
    name?: string;
    licenseNumber?: string;
    licenseCategory?: string;
    licenseExpiryDate?: string;
    contactNumber?: string;
    safetyScore?: number;
    status?: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
  },
) {
  const existingDriver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!existingDriver) {
    throw new HttpError(404, "Driver not found");
  }

  if (
    input.licenseNumber &&
    input.licenseNumber !== existingDriver.licenseNumber
  ) {
    const duplicateDriver = await prisma.driver.findUnique({
      where: { licenseNumber: input.licenseNumber },
    });

    if (duplicateDriver) {
      throw new HttpError(409, "Driver license number already exists");
    }
  }

  return prisma.driver.update({
    where: { id: driverId },
    data: {
      ...input,
      licenseExpiryDate: input.licenseExpiryDate
        ? new Date(input.licenseExpiryDate)
        : undefined,
    },
  });
}
