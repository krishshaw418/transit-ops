import { prisma } from "../lib/prisma";

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toString" in value) {
    return Number(value.toString());
  }
  return 0;
}

export async function getDashboardSummary() {
  const [
    totalVehicles,
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({
      where: { status: { not: "RETIRED" } },
    }),
    prisma.vehicle.count({
      where: { status: "AVAILABLE" },
    }),
    prisma.vehicle.count({
      where: { status: "IN_SHOP" },
    }),
    prisma.trip.count({
      where: { status: "DISPATCHED" },
    }),
    prisma.trip.count({
      where: { status: "DRAFT" },
    }),
    prisma.driver.count({
      where: { status: "ON_TRIP" },
    }),
  ]);

  const fleetUtilization =
    totalVehicles === 0
      ? 0
      : Number(((activeTrips / totalVehicles) * 100).toFixed(2));

  return {
    totalVehicles,
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilization,
  };
}

export async function getDashboardReports() {
  const [trips, fuelLogs, expenses, vehicles] = await Promise.all([
    prisma.trip.findMany({
      include: {
        vehicle: true,
      },
    }),
    prisma.fuelLog.findMany(),
    prisma.expense.findMany(),
    prisma.vehicle.findMany(),
  ]);

  const totalFuelCost = fuelLogs.reduce(
    (sum, log) => sum + toNumber(log.cost),
    0,
  );
  const totalExpenseCost = expenses.reduce(
    (sum, expense) => sum + toNumber(expense.amount),
    0,
  );
  const totalOperationalCost = totalFuelCost + totalExpenseCost;

  const totalDistance = trips.reduce(
    (sum, trip) => sum + (trip.actualDistanceKm ?? trip.plannedDistanceKm ?? 0),
    0,
  );
  const totalFuelLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0);

  const fuelEfficiency =
    totalFuelLiters === 0
      ? 0
      : Number((totalDistance / totalFuelLiters).toFixed(2));

  const vehicleReports = vehicles.map((vehicle) => {
    const vehicleTrips = trips.filter((trip) => trip.vehicleId === vehicle.id);
    const vehicleFuelLogs = fuelLogs.filter(
      (log) => log.vehicleId === vehicle.id,
    );
    const vehicleExpenses = expenses.filter(
      (expense) => expense.vehicleId === vehicle.id,
    );

    const revenue = vehicleTrips.reduce(
      (sum, trip) => sum + toNumber(trip.revenue),
      0,
    );
    const fuelCost = vehicleFuelLogs.reduce(
      (sum, log) => sum + toNumber(log.cost),
      0,
    );
    const otherCosts = vehicleExpenses.reduce(
      (sum, expense) => sum + toNumber(expense.amount),
      0,
    );
    const maintenanceAndFuel = fuelCost + otherCosts;
    const acquisitionCost = toNumber(vehicle.acquisitionCost);

    const roi =
      acquisitionCost === 0
        ? 0
        : Number(
            (((revenue - maintenanceAndFuel) / acquisitionCost) * 100).toFixed(
              2,
            ),
          );

    const totalVehicleDistance = vehicleTrips.reduce(
      (sum, trip) =>
        sum + (trip.actualDistanceKm ?? trip.plannedDistanceKm ?? 0),
      0,
    );

    const totalVehicleFuel = vehicleFuelLogs.reduce(
      (sum, log) => sum + log.liters,
      0,
    );

    const vehicleFuelEfficiency =
      totalVehicleFuel === 0
        ? 0
        : Number((totalVehicleDistance / totalVehicleFuel).toFixed(2));

    return {
      vehicleId: vehicle.id,
      registrationNo: vehicle.registrationNo,
      name: vehicle.name,
      status: vehicle.status,
      revenue,
      fuelCost,
      otherCosts,
      totalOperationalCost: maintenanceAndFuel,
      fuelEfficiency: vehicleFuelEfficiency,
      roi,
    };
  });

  return {
    totals: {
      totalFuelCost,
      totalExpenseCost,
      totalOperationalCost,
      totalDistance,
      totalFuelLiters,
      fuelEfficiency,
    },
    vehicles: vehicleReports,
  };
}
