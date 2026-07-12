import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";

export async function listMaintenanceLogs() {
  return prisma.maintenanceLog.findMany({
    include: {
      vehicle: true,
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

export async function createMaintenanceLog(input: {
  vehicleId: string;
  title: string;
  description?: string;
  notes?: string;
  createdById: string;
}) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: input.vehicleId },
  });

  if (!vehicle) {
    throw new HttpError(404, "Vehicle not found");
  }

  const activeMaintenance = await prisma.maintenanceLog.findFirst({
    where: {
      vehicleId: input.vehicleId,
      status: {
        in: ["OPEN", "IN_PROGRESS"],
      },
    },
  });

  if (activeMaintenance) {
    throw new HttpError(
      409,
      "Vehicle already has an active maintenance record",
    );
  }

  return prisma.$transaction(async (tx) => {
    const maintenanceLog = await tx.maintenanceLog.create({
      data: {
        vehicleId: input.vehicleId,
        title: input.title,
        description: input.description,
        notes: input.notes,
        createdById: input.createdById,
        status: "OPEN",
      },
      include: {
        vehicle: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await tx.vehicle.update({
      where: { id: input.vehicleId },
      data: {
        status: "IN_SHOP",
      },
    });

    return maintenanceLog;
  });
}

export async function startMaintenanceLog(
  maintenanceId: string,
  input: { notes?: string },
) {
  const maintenanceLog = await prisma.maintenanceLog.findUnique({
    where: { id: maintenanceId },
  });

  if (!maintenanceLog) {
    throw new HttpError(404, "Maintenance log not found");
  }

  if (maintenanceLog.status !== "OPEN") {
    throw new HttpError(400, "Only open maintenance can be started");
  }

  return prisma.maintenanceLog.update({
    where: { id: maintenanceId },
    data: {
      status: "IN_PROGRESS",
      startedAt: new Date(),
      notes: input.notes ?? maintenanceLog.notes,
    },
    include: {
      vehicle: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function completeMaintenanceLog(
  maintenanceId: string,
  input: { cost?: number; notes?: string },
) {
  const maintenanceLog = await prisma.maintenanceLog.findUnique({
    where: { id: maintenanceId },
    include: {
      vehicle: true,
    },
  });

  if (!maintenanceLog) {
    throw new HttpError(404, "Maintenance log not found");
  }

  if (!["OPEN", "IN_PROGRESS"].includes(maintenanceLog.status)) {
    throw new HttpError(400, "Only active maintenance can be completed");
  }

  return prisma.$transaction(async (tx) => {
    const updatedMaintenance = await tx.maintenanceLog.update({
      where: { id: maintenanceId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        cost: input.cost,
        notes: input.notes ?? maintenanceLog.notes,
      },
      include: {
        vehicle: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (maintenanceLog.vehicle.status !== "RETIRED") {
      await tx.vehicle.update({
        where: { id: maintenanceLog.vehicleId },
        data: {
          status: "AVAILABLE",
        },
      });
    }

    return updatedMaintenance;
  });
}
